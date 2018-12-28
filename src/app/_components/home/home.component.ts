import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit , Inject} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  public title: string = 'Angular 7';

  constructor(@Inject(WINDOW) private window: Window, ) { }

  ngOnInit() {
  }

  openOptions() {
  	this.window.document.getElementById('dashboard-button').click();
  }

}
