import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    // http options used for making API calls
    private httpOptions: any;
  
    // the actual JWT token
    public token: string;
  
    // the token expiration date
    public token_expires: Date;
  
    // the username of the logged in user
    public username: string;
  
    // error messages received from the login attempt
    public errors: any = [];

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(
        private http: HttpClient,
        private router: Router,
        ) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        if (this.currentUserValue) { 
            this.router.navigate(['/']);
        }
        this.httpOptions = {
          headers: new HttpHeaders({'Content-Type': 'application/json'})
        };
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public login(user) {
        console.log(JSON.stringify(user));
        return this.http.post<any>(`${environment.apiUrl}/api-token-auth/`, JSON.stringify(user), this.httpOptions)
        // .subscribe(
        //   data => {
        //     console.log('login success', data);
        //     this.updateData(data['token']);
        //     this.router.navigate(['/']);
        //     return true;
        //   },
        //   err => {
        //     if(err == 'Bad Request'){
        //         this.router.navigate(['/']);
        //         console.log('Here');
        //     }
        //     console.error('login error', err);
        //     this.errors = err['error'];
        //     return false;
        //   }
        // );
        // return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { username, password })
            .pipe(map(data => {
              // this.updateData(data);
              console.log(data);
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    private updateData(token) {
      this.token = token;
      this.errors = [];
  
      // decode the token to read the username and expiration timestamp
      const token_parts = this.token.split(/\./);
      const token_decoded = JSON.parse(window.atob(token_parts[1]));
      this.token_expires = new Date(token_decoded.exp * 1000);
      this.username = token_decoded.username;
    }
}