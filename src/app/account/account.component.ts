import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonService } from '../services/common.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  userData;

  constructor(private uS: UserService, private cS: CommonService,
    private router: Router, private sB: MatSnackBar,
    private tS: Title) { tS.setTitle('Strokes | My Account') }

  loading: boolean = true;
  newPassword: string;
  confirmNewPassword: string;

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.loading = false;
  }

  changePassword(e: any) { 
    if(confirm('Sure to Change Password?')) {
      this.loading = true;
      this.uS.changePassword({ password: this.newPassword }).subscribe(
        result => {
          this.loading = false;
          this.sB.open(`${result.message} | Use your New Password to Login next time`);
          e.target.reset();
        },
        problem => {
          this.loading = false;
          e.target.reset();
          if(problem.error.error && problem.error.error.message && problem.error.error.message == 'jwt expired') {
            this.sB.open('Your session has expired !!! Please log in again :)');
            this.logOut();
          }
          else {
            console.log(problem.error);
            this.sB.open(problem.error instanceof ProgressEvent ? 'Failed Connecting the Server. Check your Internet Connection or Try again later' : problem.error.message);
          }
        }
      );
    }
  }

  logOut() {
    if(this.cS.doLogout())
      this.navigator('home');
  }

  navigator(url: string) {
    this.router.navigateByUrl('/'+url);
  }

  isAdmin() {
    return this.cS.isAdmin();
  }

}
