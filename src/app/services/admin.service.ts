import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl+'/admin';

  fetchUsers() {
    return this.http.get<any>(this.url+'/fetchUsers');
  }

  resetPassword(data: {}) {
    return this.http.post<any>(this.url+'/resetPassword',data);
  }

  deleteUser(uid: string) {
    return this.http.get<any>(this.url+'/deleteUser/'+uid);
  }

  setSettings(file: File, data: {}) {
    let formData = new FormData();
    if(file)
      formData.append('file',file,file.name);
    if(data) {
      let info = Object.keys(data);
      info.forEach(inf => {
        formData.append(inf,data[inf]);
      })
    }
    return this.http.post<any>(this.url+'/setSettings',formData);
  }

  prepare() {
    return this.http.get<any>(this.url+'/preparedownload');
  }

  startDownload() {
    return this.http.get<any>(this.url+'/zipall');
  }

  submitNew(data: File, action: string, username: string) {
    let formData = new FormData();
    formData.append('file',data,data.name);
    formData.append('username',username);
    return this.http.post<any>(this.url+`/uploadcertificate/${action}`,formData);
  }

  deleteNew(action: string, username: string) {
    let formData = new FormData();
    formData.append('username',username);
    return this.http.post<any>(this.url+`/uploadcertificate/${action}`,formData);
  }
}
