import { Component, OnChanges, Input } from '@angular/core';
import { take } from 'rxjs';
import { DataService } from 'src/app/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css']
})
export class InstanceComponent implements OnChanges {

  @Input() public instance: string;
  public instancePath: string = null;
  public frontendPath: string = null;
  public content: object = null;

  public allStudies = new Set();
  public studiesLoaded = 0;
  public loadingFinished = false;

  constructor(private dataService: DataService) { }

  ngOnChanges(): void {
    this.instancePath = environment.instances[this.instance].apiPath;
    this.frontendPath = environment.instances[this.instance].frontendPath;

    this.dataService.getDatasetHierarchy(this.instancePath).pipe(take(1)).subscribe((data) => {
      data['data'].forEach((d: object) => { this.attachDatasetDescription(d); this.collectAllStudies(d)});
      this.content = data;
    });
  }

  public attachDatasetDescription(entry: object) {
    entry['children']?.forEach((d: object) => this.attachDatasetDescription(d));
    this.dataService.getDatasetDescription(this.instancePath, entry['dataset']).pipe(take(1)).subscribe(res => {
      if (res['description'] === null) {
        return;
      }
      entry['description'] = res['description'].substring(res['description'].indexOf('\n\n') + 1);
      this.studiesLoaded++;

      if (this.studiesLoaded === this.allStudies.size) {
        this.loadingFinished = true;
      }
    });
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
}
