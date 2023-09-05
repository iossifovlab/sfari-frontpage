/* eslint @typescript-eslint/naming-convention: 0 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject, take, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import pkceChallenge from 'pkce-challenge';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private readonly options = { headers: this.headers };
  public tokenExchangeSubject = new Subject<boolean>();

  public constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
  ) { }

  public get accessToken(): string {
    return this.cookieService.get('access_token') || '';
  }

  public get refreshAccessToken(): string {
    return localStorage.getItem('refresh_token') || '';
  }

  public generatePKCE(): string {
    const pkce = pkceChallenge();
    localStorage.setItem('code_verifier', pkce['code_verifier']);
    return pkce['code_challenge'];
  }

  public requestAccessToken(code: string): Observable<object> {
    return this.http.post(environment.authPath + '/o/token/', {
      client_id: environment.oauthClientId,
      code: code,
      grant_type: 'authorization_code',
      code_verifier: localStorage.getItem('code_verifier'),
    }, this.options).pipe(take(1), tap(res => {
      this.setTokens(res);
      localStorage.removeItem('code_verifier');
      // Remove auth code from query params and refresh navigation
      this.tokenExchangeSubject.next(true);
      this.router.navigate([], {
        queryParams: {'code': null},
        queryParamsHandling: 'merge'
      });
    }));
  }

  public revokeAccessToken(): Observable<object> {
    return this.http.post(environment.authPath + 'o/revoke_token/', {
      client_id: environment.oauthClientId,
      token: this.accessToken,
    }, this.options).pipe(take(1), tap({next: () => { this.clearTokens(); }}));
  }

  public clearTokens(): void {
    this.cookieService.delete('access_token');
    localStorage.removeItem('refresh_token');
  }

  public refreshToken() {
    if (this.refreshAccessToken !== '') {
      return this.http.post(environment.authPath + 'o/token/', {
        grant_type: 'refresh_token',
        client_id: environment.oauthClientId,
        refresh_token: this.refreshAccessToken,
      }, this.options).pipe(
        take(1),
        tap(res => {
          this.setTokens(res);
        }),
        catchError((err, caught) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (err.status === 500 || (err.status === 400 && err.error.error === 'invalid_grant')) {
            this.clearTokens();
            window.location.reload();
          }
          return caught;
        })
      );
    } else {
      this.clearTokens();
      window.location.reload();
      return null;
    }
  }

  private setTokens(res: object): void {
    this.cookieService.set('access_token', res['access_token'] as string, {path: '/'});
    localStorage.setItem('refresh_token', res['refresh_token'] as string);
  }
}
