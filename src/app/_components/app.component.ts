import { Component } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(public authService: AuthenticationService) { }

  search() {
  	window.location.href = "https://www.google.co.in/search?q=Bhaskar+Rajoriya";
  }

}
