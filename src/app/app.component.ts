import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, take, share } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/data.service';
import { AuthService } from 'src/app/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  content = null;
  public userInfo$: Observable<any>;
  public hg38Link = environment.hg38Frontend;
  public hg19Link = environment.hg19Frontend;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      // This is done in order to reload data after a login, otherwise the page content is not updated appropriately
      if (event instanceof NavigationEnd) {
        this.dataService.getDatasetHierarchy(`${environment.hg38Path}/${environment.apiSuffix}`).subscribe((data) => {
          data['data'].forEach((d: object) => this.attachDatasetDescription(d));
          this.content = data;
        });
        this.reloadUserData();
        this.userInfo$ = this.dataService.getUserInfoObservable().pipe(share());
      }
    });
  }

  public reloadUserData(): void {
    this.dataService.getUserInfo().pipe(take(1)).subscribe(() => {});
  }

  public login(): void {
    const codeChallenge = this.authService.generatePKCE();
    location.href = `${environment.authPath}/o/authorize/?response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}&client_id=${environment.oauthClientId}`;
  }

  public logout(): void {
    this.dataService.logout().subscribe(() => this.reloadUserData());
  }

  public constructLink(instance: string, datasetId: string) {
    return `${instance === 'hg38' ? environment.hg38Frontend : environment.hg19Frontend}/datasets/${datasetId}`;
  }

  public attachDatasetDescription(entry: object) {
    entry['children']?.forEach((d: object) => this.attachDatasetDescription(d));

    this.dataService.getDatasetDescription(
      `${environment.hg38Path}/${environment.apiSuffix}`, entry['dataset']
    ).pipe(take(1)).subscribe(res => { entry['description'] = res['description']; });
  }
}
