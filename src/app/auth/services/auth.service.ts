import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { SocialAuthService, GoogleLoginProvider, FacebookLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    //private socialAuthService: SocialAuthService
  ) {}

  /* login(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/login', { email, password });
  }

  loginWithGoogle(): Promise<SocialUser> {
    return this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  loginWithFacebook(): Promise<SocialUser> {
    return this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  logout(): Promise<void> {
    return this.socialAuthService.signOut();
  } */
}
