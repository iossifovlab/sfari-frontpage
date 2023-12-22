import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, take, share } from 'rxjs';
import { environment } from '../environments/environment';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { InstanceComponent } from './instance/instance.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public instances: string[] = Object.keys(environment.instances);
  public userInfo$: Observable<any>;
  @ViewChild(InstanceComponent) instanceComponent: InstanceComponent;

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
}
