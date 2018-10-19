import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class FileService {
	public readonly apiUrl = environment.adminApiUrl;
    public readonly baseUrl = environment.baseUrl;
    public module:string = 'files';

    constructor(public http: HttpClient) {
        
    }

    all(parentModule, parentId, pageNo, keyword, perPage, sortBy, orderBy) {
    	return this.http.get(this.apiUrl+'/'+parentModule+'/'+parentId+'/'+this.module+'?page='+pageNo+'&keyword='+keyword+'&per_page='+keyword+'&sort_by='+keyword+'&order_by'+keyword );
    }

    create(parentModule, parentId) {
        return this.http.get(this.apiUrl+'/'+parentModule+'/'+parentId+'/'+this.module+'/create');
    }

    store(parentModule, parentId, obj) {
    	return this.http.post(this.apiUrl+'/'+parentModule+'/'+parentId+'/'+this.module+'', objectToFormData(obj) );
    }

    edit(parentModule, parentId, id) {
        return this.http.get(this.apiUrl+'/'+parentModule+'/'+parentId+'/'+this.module+'/'+id+'/edit');
    }

    show(parentModule, parentId, id) {
        return this.http.get(this.apiUrl+'/'+parentModule+'/'+parentId+'/'+this.module+'/'+id );
    }

    update(parentModule, parentId, id, obj) {
    	return this.http.patch(this.apiUrl+'/'+parentModule+'/'+parentId+'/'+this.module+'/'+id, objectToFormData(obj) );
    }

    destroy(parentModule, parentId, id) {
    	return this.http.delete(this.apiUrl+'/'+parentModule+'/'+parentId+'/'+this.module+'/'+id);
    }
}

const objectToFormData = function (obj, form = null, namespace = null) {

    var fd = form || new FormData();
    var formKey;
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {

            if (namespace) {
                formKey = namespace + '[' + property + ']';
            } else {
                formKey = property;
            }

            // if the property is an object, but not a File,
            // use recursivity.
            const value = obj[property];
            if (typeof value === 'object' && !(value instanceof File)) {
                objectToFormData(value, fd, formKey);
            } else if(value) {
                // if it's a string or a File object
                fd.append(formKey, value);
            }
        }
    }

    return fd;

};