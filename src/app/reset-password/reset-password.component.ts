import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { CommonService } from '../services/common.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  constructor(private aS: AdminService, private cS: CommonService, private router: Router,
    private sB: MatSnackBar, private tS: Title) { tS.setTitle('Strokes | User Password Reset | ADMIN') }
  
  loading: boolean = true;
  usersData;
  username: string = "";
  selectedUser = undefined;
  newPassword: string;
  confirmNewPassword: string;
  userData;

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.getUsers();
  }

  getUsers() {
    this.aS.fetchUsers().subscribe(
      result => {
        if(result.status) {
          this.usersData = result.user;
          this.usersData.sort((u1,u2) => {
            return u1.name.localeCompare(u2.name);
          });
          this.usersData.forEach(async (userr) => {
            delete userr['password'];
            delete userr['uploaded'];
            delete userr['admin'];
            delete userr['submissions'];
            delete userr['createdAt'];
            delete userr['updatedAt'];
          });
        }
        else
          this.sB.open(result.message);
        this.loading = false;
      },
      problem => {
        this.loading = false;
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

  searchUser() {
    this.selectedUser = this.usersData.find(user => {
      return user.username == this.username;
    });
  }

  resetPassword(e: any) { 
    if(confirm('Sure to Reset password for the user with username '+this.username)) {
      this.loading = true;
      this.aS.resetPassword({ username: this.username, password: this.newPassword }).subscribe(
        result => {
          this.loading = false;
          this.sB.open(`${result.message}`);
          e.reset();
        },
        problem => {
          this.loading = false;
          e.reset();
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
