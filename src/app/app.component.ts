import { Component, OnInit, ChangeDetectorRef, ViewChildren, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, take, share } from 'rxjs';
import { environment } from '../environments/environment';
import { DataService } from './data.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, AfterViewChecked {
  public instances: string[] = Object.keys(environment.instances);
  public userInfo$: Observable<any>;

  @ViewChildren('instanceComponent') instanceComponents;
  public finishedLoading = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      // This is done in order to reload data after a login, otherwise the page content is not updated appropriately
      if (event instanceof NavigationEnd) {
        this.reloadUserData();
        this.userInfo$ = this.dataService.getUserInfoObservable().pipe(share());
      }
    });
  }

  ngAfterViewInit(): void {
    this.waitForInstancesToLoad().then(() => {
      this.finishedLoading = true;
    });
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  public reloadUserData(): void {
    this.dataService.getUserInfo().pipe(take(1)).subscribe(() => {});
  }

  public login(): void {
    const codeChallenge = this.authService.generatePKCE();
    window.location.href = `${environment.authPath}/o/authorize/?response_type=code`
      + `&code_challenge_method=S256`
      + `&code_challenge=${codeChallenge}`
      + `&scope=read`
      + `&client_id=${environment.oauthClientId}`;
  }

  public logout(): void {
    this.dataService.logout().subscribe(() => this.reloadUserData());
  }

  private async waitForInstancesToLoad(): Promise<void> {
    return new Promise<void>(resolve => {
      const timer = setInterval(() => {
        let allInstancesHaveLoaded = true;
        console.log('1')
        for (let i = 0; i < this.instances.length; i++) {
          if (!this.instanceComponents.toArray()[i].loadingFinished) {
            allInstancesHaveLoaded = false
          }
        }

        if (allInstancesHaveLoaded) {
          resolve();
          clearInterval(timer);
        }
      }, 50);
      
    });
  }
}
