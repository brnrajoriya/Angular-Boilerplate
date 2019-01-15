import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { Injectable, Inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    public headers: HttpHeaders;
 constructor(@Inject(LOCAL_STORAGE) private localStorage: any) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //append headers
        this.headers = new HttpHeaders();
        this.headers.set("Content-Type", 'application/json');
        this.headers.set("Access-Control-Allow-Origin", "*");
        this.headers.set("Access-Control-Allow-Headers", "Origin, Authorization, Content-Type, Accept");

        request = request.clone({
            headers: this.headers
        });
        // add authorization header with jwt token if available
        let currentUser = JSON.parse(this.localStorage.getItem('user'));
        if (currentUser && currentUser.token) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
        }
        return next.handle(request);
    }
}
