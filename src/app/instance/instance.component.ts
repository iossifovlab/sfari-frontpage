import { Component, OnChanges, Input } from '@angular/core';
import { take, combineLatest } from 'rxjs';
import { DataService } from '../data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css']
})
export class InstanceComponent implements OnChanges {
  @Input() public instance: string;
  public instancePath: string = null;
  public frontendPath: string = null;
  public frontendPathToShow: string = null;
  public hasAgp: boolean;
  public agpPath: string = null;
  public content: object = null;

  public allStudies = new Set();
  public visibleDatasets: string[];
  public datasets: string[];
  public studiesLoaded = 0;
  public loadingFinished = false;

  constructor(private dataService: DataService) { }

  ngOnChanges(): void {
    this.instancePath = environment.instances[this.instance].apiPath;
    this.frontendPath = environment.instances[this.instance].frontendPath;
    this.frontendPathToShow = this.frontendPath.replace(/((http|https):\/\/)|(\/\/)/g,'');

    this.dataService.getAgp(this.instancePath).subscribe(res => this.hasAgp = res);
    this.agpPath = environment.instances[this.instance].frontendPath + '/autism-gene-profiles';
  
    combineLatest({
      datasets: this.dataService.getDatasetHierarchy(this.instancePath),
      visibleDatasets: this.dataService.getVisibleDatasets(this.instancePath)
    }).subscribe(({datasets, visibleDatasets}) => {
      datasets['data'].forEach((d: object) => {
        this.attachDatasetDescription(d); this.collectAllStudies(d)
      });
      this.content = datasets;
      this.visibleDatasets = visibleDatasets as string[];

      // show first two levels by default
      this.datasets = this.content['data'][0].children.map(c => c.dataset);
      this.datasets.push(this.content['data'][0].dataset);
    });
  }

  public attachDatasetDescription(entry: object) {
    entry['children']?.forEach((d: object) => this.attachDatasetDescription(d));
    this.dataService.getDatasetDescription(this.instancePath, entry['dataset']).pipe(take(1)).subscribe(res => {
      if (res['description']) {
        entry['description'] = this.getFirstParagraph(res['description']);
      }

      this.studiesLoaded++;
      if (this.studiesLoaded === this.allStudies.size) {
        this.loadingFinished = true;
      }
    });
  }

  public getFirstParagraph(description: string): string {

    let splitDescription = description.split('\n\n');
    
    if (splitDescription[0].includes('#')) {
      let regexTitle = new RegExp(/^##((?:\n|.)*?)$\n/, 'm');
      let titleMatch = regexTitle.exec(splitDescription[0]);
      return titleMatch ? splitDescription[0].replace(/^##((?:\n|.)*?)$\n/m, '') : splitDescription[1];
    }
    return splitDescription[0];
  }

  public collectAllStudies(data: object): void {
    this.allStudies.add(data['dataset']);
    if (data['children'] && data['children'].length !== 0) {
      data['children'].forEach(dataset => {
        this.collectAllStudies(dataset);
      });
    }
  }

  public constructLink(datasetId: string) {
    return `${this.frontendPath}/datasets/${datasetId}`
  }

  public toggleDatasetCollapse(dataset): void {
    if (!this.visibleDatasets.includes(dataset.dataset)) {
      return;
    }

    const children = dataset.children.map(c => c.dataset);
    if (this.datasets.includes(dataset.children.map(d => d.dataset)[0])) {
      this.datasets = this.datasets.filter(a => !new Set(this.findAllByKey(dataset.children, 'dataset')).has(a));
    } else {
      this.datasets.push(...children);
    }
  }

  public datasetHasVisibleChildren(children: string[]): boolean {
    let result = false;

    if (!children) {
      return result;
    }

    children.forEach(c => {
      if (this.visibleDatasets.includes(c['dataset'])) {
        result = true;
      }
    });
    return result;
  }

  public findAllByKey(obj, keyToFind): string[] {
    return Object.entries(obj)
      .reduce((acc, [key, value]) => (key === keyToFind)
        ? acc.concat(value)
        : (typeof value === 'object' && value)
        ? acc.concat(this.findAllByKey(value, keyToFind))
        : acc
      , [])
  }
}