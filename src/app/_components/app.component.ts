import { WINDOW } from '@ng-toolkit/universal';
import { Component , Inject} from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(@Inject(WINDOW) private window: Window, public authService: AuthenticationService) { }

  search() {
  	this.window.location.href = "https://www.google.co.in/search?q=Bhaskar+Rajoriya";
  }

}
