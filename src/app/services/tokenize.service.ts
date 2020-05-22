import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TokenizeService implements HttpInterceptor {
  intercept(req, next) {
    let interceptApis = ['deleteUser','submit','submitnew','fetchUsers','download','preparedownload','zipall','uploadcertificate','setSettings','uploadBanner','resetPassword','changePassword']
    let parts = req.url.split('/');
    if(interceptApis.indexOf(parts[parts.length-1]) > -1 || interceptApis.indexOf(parts[parts.length-2]) > -1 || interceptApis.indexOf(parts[parts.length-3]) > -1)
    {
      let authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return next.handle(authReq);
    }
    else
    return next.handle(req);
  }
}