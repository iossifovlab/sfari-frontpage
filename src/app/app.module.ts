import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';

import { AppComponent } from './app.component';

import { AuthService } from './auth.service';
import { AuthResolverService } from './auth-resolver.service';
import { AuthInterceptorService } from './auth-interceptor.service';
import { DataService } from './data.service';
import { InstanceComponent } from './instance/instance.component';

const appRoutes: Routes = [
  {
    path: '',
    component: AppComponent,
    resolve: { _: AuthResolverService },
  },
]

@NgModule({
  declarations: [
    AppComponent,
    InstanceComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    MarkdownModule.forRoot(),
  ],
  providers: [
    AuthService,
    AuthResolverService,
    AuthInterceptorService,
    DataService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
