import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DummyService } from '../../../_services/index';
import { Dummy } from '../../../_models/index';

@Component({
  selector: 'app-create-dummy',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateDummyComponent implements OnInit {
	unique_column: number;
	keyword: string;
	dummy = {};
	
	constructor(public dummyService: DummyService, public router: Router) { }

	ngOnInit() {
		this.create();
	}

	create() {

    }

    store(dummy) {
    	this.dummyService.store(dummy).subscribe(res => {
    		if(res['status'] == 'ok') {
    			this.router.navigate(['/'+this.dummyService.module+'/edit/'+res['dummy'].id]);
    		}
	    }, error => {
	    	console.error(error);
	    });
    }
}
