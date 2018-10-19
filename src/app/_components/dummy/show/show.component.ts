import { Component, OnInit } from '@angular/core';
import { DummyService } from '../../../_services/index';
import { Dummy } from '../../../_models/index';

@Component({
  selector: 'app-show-dummy',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowDummyComponent implements OnInit {
	id:number;
	keyword:string;
	dummy:Dummy[] = [];
	
	constructor(public dummyService: DummyService) { }

	ngOnInit() {
		this.show(this.id);
	}

	show(id) {
    	this.dummyService.show(id).subscribe(res => {
    		
	    }, error => {
	    	console.error(error);
	    });
    }
}
