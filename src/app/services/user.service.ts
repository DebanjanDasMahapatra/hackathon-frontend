import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../User';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl+'/users';

  fetchUserNameEmailList() {
    return this.http.get<any>(this.url+'/fetchUserNamesEmails');
  }

  register(data: User, photo: File, idcard: File) {
    let formData = new FormData();
    formData.append('files[]',photo,photo.name);
    formData.append('files[]',idcard,idcard.name);
    let keys = Object.keys(data);
    keys.forEach(key => {
      formData.append(key,data[key]);
    })
    return this.http.post<any>(this.url+'/register',formData);
  }

  login(data: {}) {
    return this.http.post<any>(this.url+'/login',data);
  }

  changePassword(data: {}) {
    return this.http.post<any>(this.url+'/changePassword',data);
  }

  submitNew(data: File, action: string, index: number) {
    let formData = new FormData();
    formData.append('file',data,data.name);
    return this.http.post<any>(this.url+`/submitnew/${index}/${action}`,formData);
  }

  deleteNew(action: string, index: number) {
    return this.http.post<any>(this.url+`/submitnew/${index}/${action}`,{});
  }
}
