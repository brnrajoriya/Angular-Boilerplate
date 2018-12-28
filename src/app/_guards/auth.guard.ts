import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { Injectable, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
  
   constructor(@Inject(LOCAL_STORAGE) private localStorage: any, public router: Router) { }

   canActivate() {
	   if (this.localStorage.getItem('user')) {
	       // logged in so return true
	       return true;
	   }	   
	   // not logged in so redirect to login page
	   this.localStorage.clear();
	   this.router.navigate(['/login']);
	   return false;
	}
}
