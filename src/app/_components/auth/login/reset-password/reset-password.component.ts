import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../../../_services/authentication.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
 
  passwordsMatch: boolean;
  warning: string;
  token: string;

  constructor(
  	public authenticationService: AuthenticationService,
  	public router: Router,
  	public route: ActivatedRoute
  ) {
  	this.passwordsMatch = true;
  	this.route.params.subscribe(params => {
      this.token = params['token'];
    });
  }

  ngOnInit() {
  }

  onChangePassword(newPassword: string, confirmedPassword: string){
    if(newPassword != confirmedPassword) {
      this.passwordsMatch = false;
      this.warning = "Password does not match the confirm password!";
      return;
    } else if(newPassword == "") {
      this.passwordsMatch = false;
      this.warning = "You can't use empty passwords!";
      return;
    } else {
      this.passwordsMatch = true;
      this.authenticationService.resetPassword(newPassword, confirmedPassword, this.token)
        .subscribe(result => {
        	if(result['success']) {
        		this.router.navigate(['/login']);
        	} else {
        		let error = '';
        		let messageArr = result['message']['password'];
		        if(messageArr) {
		          for(let i = 0; i < messageArr.length; i++ ) {
		            error += messageArr[i] + ' ';
		          }
		        } else {
		          error = result['message'];
		        }
		        this.warning = error;
		        this.passwordsMatch = false;
        	}
      }, error => { console.log(error); });
    }
  }

}
