import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../../_services/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  email: string;
  message: boolean = false;
  error: string;
  emailNotFound = false;
  waiting = false;

  constructor( 
    public authenticationService: AuthenticationService
  ) { 
    this.error = "Please write a valid email adress!";
  }

  ngOnInit() { 
  }

  sendEmail() {
    this.emailNotFound = false;
    this.waiting = true;
    this.authenticationService.sendPasswordResetEmail(this.email)
    .subscribe(result => {
      if(result['success']) {
        this.message = true; 
      } else {
        let error = '';
        let messageArr = result['message']['email'];
        if(messageArr) {
          for(let i = 0; i < messageArr.length; i++ ) {
            error += messageArr[i] + ' ';
          }
        } else {
          error = result['message'];
        }
        this.error = error;
        this.emailNotFound = true;
      }
      this.waiting = false;
    });
  }

}
