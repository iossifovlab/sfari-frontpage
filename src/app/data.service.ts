import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';
import { Observable, ReplaySubject, map, tap, take, switchMap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth.service';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly datasetsUrl = 'datasets/hierarchy/';
  private readonly descriptionUrl = 'datasets/description';
  private readonly logoutUrl = 'users/logout';
  private readonly userInfoUrl = 'users/get_user_info';

  private userInfo$ = new ReplaySubject<{}>(1);
  private lastUserInfo = null;

  public constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private locationStrategy: LocationStrategy,
    private authService: AuthService,
  ) {}

  public getDatasetHierarchy(apiPath: string): Observable<object> {
    return this.http.get(`${apiPath}/${this.datasetsUrl}`);
  }

  public getDatasetDescription(apiPath: string, datasetId: string): Observable<object> {
    return this.http.get(`${apiPath}/${this.descriptionUrl}/${datasetId}`);
  }

  public logout(): Observable<object> {
    const csrfToken = this.cookieService.get('csrftoken');
    const headers = { 'X-CSRFToken': csrfToken };
    const options = { headers: headers, withCredentials: true };

    return this.authService.revokeAccessToken().pipe(
      take(1),
      switchMap(() => { return this.http.post(`${environment.authPath}/${environment.apiSuffix}/${this.logoutUrl}`, {}, options) }),
      tap(() => {
        window.location.href = this.locationStrategy.getBaseHref();
      })
    );
  }

  public cachedUserInfo() {
    return this.lastUserInfo;
  }

  public getUserInfoObservable(): Observable<any> {
    return this.userInfo$.asObservable();
  }

  public getUserInfo(): Observable<any> {
    const options = { withCredentials: true };

    return this.http.get(`${environment.authPath}/${environment.apiSuffix}/${this.userInfoUrl}`, options).pipe(
      map(res => res),
      tap(userInfo => {
        this.userInfo$.next(userInfo);
        this.lastUserInfo = userInfo;
      })
    );
  }
}
