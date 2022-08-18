import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthResolverService implements Resolve<object> {

  constructor(
    private authService: AuthService,
  ) { }

  public resolve(route: ActivatedRouteSnapshot): Observable<object> {
    if (route.queryParams['code']) {
      return this.authService.requestAccessToken(route.queryParams['code']);
    }
    if (window.opener) {
      window.opener.location.reload();
      window.close()
    }
    return of({});
  }
}
