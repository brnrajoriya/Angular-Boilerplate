import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class DummyService {
	public readonly apiUrl = environment.adminApiUrl;
    public readonly baseUrl = environment.baseUrl;
    public module:string = 'dummies';

    constructor(public http: HttpClient) {
        
    }

    all(pageNo, keyword, perPage, sortBy, orderBy) {
    	return this.http.get(this.apiUrl+'/'+this.module+'?page='+pageNo+'&keyword='+keyword+'&per_page='+keyword+'&sort_by='+keyword+'&order_by'+keyword );
    }

    create() {
        return this.http.get(this.apiUrl+'/'+this.module+'/create');
    }

    store(obj) {
    	return this.http.post(this.apiUrl+'/'+this.module+'', obj );
    }

    edit(id) {
        return this.http.get(this.apiUrl+'/'+this.module+'/'+id+'/edit');
    }

    show(id) {
        return this.http.get(this.apiUrl+'/'+this.module+'/'+id );
    }

    update(id, obj) {
    	return this.http.patch(this.apiUrl+'/'+this.module+'/'+id, obj );
    }

    destroy(id) {
    	return this.http.delete(this.apiUrl+'/'+this.module+'/'+id);
    }
}
