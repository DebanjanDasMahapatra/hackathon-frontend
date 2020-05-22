import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { CommonService } from '../services/common.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit {

  constructor(private aS: AdminService, private cS: CommonService, private router: Router,
    private sB: MatSnackBar, private tS: Title) { tS.setTitle('Strokes | Certificate Panel | ADMIN') }
  
  loading: boolean = true;
  everythingFine: boolean = false;
  everythingFine2: boolean = false;
  usersData;
  userData;
  submissions = [{
    user: undefined,
    username: "",
    file: undefined
  }];
  deletions = [{
    user: undefined,
    username: ""
  }];

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.submissions = [{
      user: undefined,
      username: "",
      file: undefined
    }];
    this.deletions = [{
      user: undefined,
      username: ""
    }];
    this.checkEverything(null,false);
    this.checkEverything2(null,false);
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

  addSubToArray() {
    this.submissions.push({
      user: undefined,
      username: "",
      file: undefined
    });
    this.checkEverything(null,false);
  }

  deleteSubFromArray(i: number) {
    this.submissions.splice(i,1);
  }

  addDelToArray() {
    this.deletions.push({
      user: undefined,
      username: ""
    });
    this.checkEverything2(null,false);
  }

  deleteDelFromArray(i: number) {
    this.deletions.splice(i,1);
  }

  checkEverything(i: number = -1, v: boolean = true) {
    if(v) {
      this.submissions[i].user = this.usersData.find(userr => {
        return userr.username == this.submissions[i].username
      })
    }
    this.everythingFine = this.submissions.find(sub => {
      return !(sub.file && sub.username)
    }) == undefined;
  }

  checkEverything2(i: number = -1, v: boolean = true) {
    if(v) {
      this.deletions[i].user = this.usersData.find(userr => {
        return userr.username == this.deletions[i].username
      })
    }
    this.everythingFine2 = this.deletions.find(sub => {
      return !sub.username
    }) == undefined;
  }

  fileReadNew(e: FileList, i: number) {
    let temp: File = e.item(0);
    if(temp && temp.type != 'application/pdf')
      this.sB.open('Sorry, only PDF is allowed');
    else
      this.submissions[i].file = e.item(0);
    this.checkEverything(i,false);
  }

  uploadSubmission(e: any) {
    if(confirm(`Upload PDFs?`)) {
      this.loading = true;
      this.doUpload(0,e);
    }
  }

  deleteSubmission(e: any) {
    if(confirm(`Delete PDFs?`)) {
      this.loading = true;
      this.doDelete(0,e);
    }
  }

  doUpload(i: number, e: any) {
    console.log(this.submissions[i]);
    this.aS.submitNew(this.submissions[i].file, this.submissions[i].user.uploaded ? 'edit' : 'new',this.submissions[i].username).subscribe(
      result => {
        this.sB.open(`[${this.submissions[i].username}]: ${result.message}`);
        this.submissions[i] = undefined;
        if(result.status) {
          if(i == this.submissions.length-1) {
            e.reset();
            this.ngOnInit();
          }
          else
            this.doUpload(i+1,e);
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

  doDelete(i: number, e: any) {
    this.aS.deleteNew('delete',this.deletions[i].username).subscribe(
      result => {
        this.sB.open(`[${this.deletions[i].username}]: ${result.message}`);
        if(result.status) {
          if(i == this.deletions.length-1) {
            e.reset();
            this.ngOnInit();
          }
          else
            this.doDelete(i+1,e);
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
