import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '@app/_services';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';

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

    // private currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<User>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService
    ) { 
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) { 
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login({'username': this.f.username.value, 'password': this.f.password.value})
            .pipe(first())
            .subscribe(
                data => {
                    console.log("Login success");
                    console.log(data);
                    // this.updateData(data['token']);
                    this.router.navigate([this.returnUrl]);
                    this.loading = false;
                },
                error => {
                    if(error == 'Bad Request'){
                        error = "Invalid Username/Password";
                    }
                    this.error = error;
                    this.loading = false;
                });
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
