import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthenticationService {
    public token: string;
    public headers: HttpHeaders;
    public readonly apiUrl = environment.apiUrl;
    public readonly baseUrl = environment.baseUrl;

    constructor(public http: HttpClient) {
        // set token if saved in local storage
        var currentUser = JSON.parse(localStorage.getItem('user'));
        this.token = currentUser && currentUser.token;
    }

    isLoggedIn() {
        if (localStorage.getItem('user')) {
           return true;
       }       
       return false;
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(this.apiUrl+'/auth/login', { username: email, password: password })
            .pipe(
                map((response: Response) => {
                    // login successful if there's a jwt token in the response
                    this.token = response['token'];
                    let expiresIn = response['expires_in'];
                    if (this.token) {
                        // store expiresIn and jwt token in local storage to keep user logged in between page refreshes
                        localStorage.setItem('user', 
                            JSON.stringify({ expires_in: expiresIn, token: this.token }));
                    }
                    return response;
                })
            );
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.http.post(this.apiUrl+'/auth/signup', { email: email, name: username, password: password })
            .pipe(
                map((response: Response) => {
                    // register successful if there's a jwt token in the response
                    this.token = response['token'];
                    let expiresIn = response['expires_in'];
                    if (this.token) {
                        // store expiresIn and jwt token in local storage to keep user logged in between page refreshes
                        localStorage.setItem('user', 
                            JSON.stringify({ expires_in: expiresIn, token: this.token }));
                    }
                    return response;
                })
            );
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('user');
    }

    sendPasswordResetEmail(email: string): Observable<any>  {
        return this.http.post(this.apiUrl+'/auth/recovery', { email: email})
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

    resetPassword(newPassword: string, confirmedPassword: string, token: string): Observable<any> {
        return this.http.post(this.apiUrl+'/auth/reset', { password: newPassword, password_confirmation: confirmedPassword, token: token })
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

}