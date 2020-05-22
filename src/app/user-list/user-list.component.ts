import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AdminService } from '../services/admin.service';
import { User } from '../User';
import { CommonService } from '../services/common.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  constructor(private aS: AdminService, private cS: CommonService, private router: Router,
    private sB: MatSnackBar, private tS: Title) { tS.setTitle('Strokes | User Info | ADMIN') }

  displayedColumns: string[] = ['a','b','c','d','e','f','g','h','i','j'];
  dataSource: MatTableDataSource<User>;
  usersData = [];
  show = [true,true,true,true,true,true,true,true,true,false];
  userData;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  loading: boolean = true;

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.getUsers();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getUsers() {
    this.dataSource = undefined;
    this.usersData = undefined;
    this.aS.fetchUsers().subscribe(
      result => {
        this.loading = false;
        if(result.status) {
          this.usersData = result.user;
          this.usersData.forEach(userr => {
            userr.createdAt = new Date(userr.createdAt).toString().replace('GMT+0530 (India Standard Time)','Hrs IST');
          });
          this.dataSource = new MatTableDataSource<User>(this.usersData);
          setTimeout(() => this.dataSource.paginator = this.paginator);
        }
        else
          this.sB.open(result.message);
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

  toggle(id: string) {
    let index = this.displayedColumns.indexOf(id);
    if(index == -1) {
      this.displayedColumns.push(id);
      this.displayedColumns.sort();
    }
    else
      this.displayedColumns.splice(index,1);
  }

  deleteUser(username: string) {
    if(this.cS.isAdmin()) {
      if(confirm('Sure to Delete User with username '+username+'?')) {
        this.loading = true;
        this.aS.deleteUser(username).subscribe(
          result => {
            if(result.status) {
              this.sB.open(result.message);
              this.getUsers();
            }
            else {
              this.loading = false;
              this.sB.open(result.message);
            }
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
    }
    else {
      this.sB.open('Some problem occurred :/ Please log in again');
      this.logOut();
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