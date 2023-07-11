import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, take, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import pkceChallenge from 'pkce-challenge';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private readonly options = { headers: this.headers };
  private _accessToken = '';
  private _refreshToken = '';

  public tokenExchangeSubject = new Subject<boolean>();

  public constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this._accessToken = localStorage.getItem('access_token') || '';
    this._refreshToken = localStorage.getItem('refresh_token') || '';
  }

  public getAccessToken(): string {
    return this._accessToken;
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
    return this.http.post(environment.authPath + '/o/revoke_token/', {
      client_id: environment.oauthClientId,
      token: this._accessToken,
    }, this.options).pipe(take(1), tap(this.clearTokens));
  }

  public clearTokens(): void {
    this._accessToken = '';
    this._refreshToken = '';
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  public refreshToken(): Observable<object> {
    if (this._refreshToken !== '') {
      return this.http.post(environment.authPath + '/o/token/', {
        grant_type: 'refresh_token',
        client_id: environment.oauthClientId,
        refresh_token: this._refreshToken,
      }, this.options).pipe(
        take(1),
        tap(res => {
          this.setTokens(res);
        }),
        catchError((err, caught) => {
          if (err.status === 400 && err.error.error === 'invalid_grant') {
            this.clearTokens();
            window.location.reload()
          }
          return caught;
        })
      );
    } else {
      return of(null);
    }
  }

  private setTokens(res: object): void {
    this._accessToken = res['access_token'];
    this._refreshToken = res['refresh_token'];
    localStorage.setItem('access_token', this._accessToken);
    localStorage.setItem('refresh_token', this._refreshToken);
  }
}
