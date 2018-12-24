import { Component, OnInit } from '@angular/core';
import { DummyService } from '../../../_services/index';
import { Dummy } from '../../../_models/index';

@Component({
  selector: 'app-edit-dummy',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditDummyComponent implements OnInit {
	unique_column:number;
	keyword:string;
	dummy;
	
	constructor(public dummyService: DummyService) { }

	ngOnInit() {
		this.edit(this.unique_column);
	}

	edit(unique_column) {
		this.dummy={unique_column:1, column_1:'Value 1', column_2:'Value 2', column_3:'Value 3'};
    }

    update(unique_column, dummy) {
    	this.dummyService.update(unique_column, dummy).subscribe(res => {
    		
	    }, error => {
	    	console.error(error);
	    });
    }
}
