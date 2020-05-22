import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

  constructor(private CS: CommonService) {}

  canActivate() {
    return this.CS.isLoggedIn();
  }
  
}
