import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl + '/common';

  download() {
    return this.http.get<any>(this.url+'/download');
  }

  getSettings() {
    return this.http.get<any>(this.url+'/getSettings');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && !!localStorage.getItem('admin') && localStorage.getItem('admin') == 'hackcurbrain';
  }

  doLogout(): boolean {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    return true;
  }
}
