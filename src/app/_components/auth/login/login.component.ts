import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../_services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string = '';
  public password: string = '';
  public warningMessage: string;

  constructor(public authService: AuthenticationService, public router: Router) { 
  }

  ngOnInit() {
  }

  onLogIn() {
    this.authService.login(this.email, this.password)
    .subscribe(res => {
      //check for errors
      this.warningMessage = '';
      if(Array.isArray(res)) {
        this.warningMessage += res[0];
      } 
      // if not errors - navigate to home
      if(!this.warningMessage)
        this.router.navigate(['/']);
    }, error => {
      this.warningMessage = "Invalid Credentials!";
      console.error(error);
    } );
  }

}
