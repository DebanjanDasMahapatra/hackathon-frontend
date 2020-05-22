import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { UserService } from '../services/user.service';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';
import { AdminService } from '../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mysubmission',
  templateUrl: './mysubmission.component.html',
  styleUrls: ['./mysubmission.component.css']
})
export class MysubmissionComponent implements OnInit {

  userData;

  constructor(private uS: UserService, private cS: CommonService, private aS: AdminService,
    private router: Router, private sB: MatSnackBar,
    private tS: Title) { tS.setTitle('Strokes | My Submission') }

  loading: boolean = true;
  editing: boolean = false;
  ended: boolean = false;
  started: boolean = false;
  
  currentSubmission: string;
  currentSubmissions: string[];
  photo: string;
  idcard: string;
  submission: File;
  submissions: File[] = [undefined,undefined,undefined,undefined];
  descriptions: string[] = ["An image while painting", "Another image while painting",
  "An image of final painting with artist", "An image of final painting only"];
  submitImageNames: string[] = ["processing1","processing2","paintingWithArtist","finalPainting"];
  prefix: string;
  settings = {
    "title": "Cannot Fetch INFO",
    "description": "Cannot Fetch INFO",
    "startTime": "Cannot Fetch INFO",
    "endTime": "Cannot Fetch INFO",
    "banner": ""
  };

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.photo = environment.apiUrl+'/common/view/'+this.userData.username+'/photo';
    this.idcard = environment.apiUrl+'/common/view/'+this.userData.username+'/idcard';
    this.prefix = environment.apiUrl+'/common/view/'+this.userData.username+'/';
    if(this.userData.uploaded)
      this.currentSubmission = environment.apiUrl+'/common/certs/'+this.userData.username+'/'+this.userData.name;
    else
      this.currentSubmission = undefined;
    this.currentSubmissions = this.userData.submissions;
    this.getSettings();
  }

  getSettings() {
    this.submission = undefined;
    this.cS.getSettings().subscribe(
      result => {
        this.loading = false;
        if(!result.status)
          return;
        let cd = new Date(result.serverDate);
        this.settings.title = result.data.title;
        this.settings.description = result.data.description;
        this.settings.banner = result.data.banner == 'NA' ? 'Cannot Fetch INFO' : environment.apiUrl + '/common/getBanner/' + result.data.banner;
        let sd = new Date(result.data.startTime);
        this.started = this.isAdmin() ? true : (cd.getTime() >= sd.getTime());
        this.settings.startTime = sd.toString().replace('GMT+0530 (India Standard Time)','Hrs IST');
        let ed = new Date(result.data.endTime)
        this.ended = this.isAdmin() ? false : (cd.getTime() >= ed.getTime());
        this.settings.endTime = ed.toString().replace('GMT+0530 (India Standard Time)','Hrs IST');
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

  fileRead(e: FileList) {
    this.submission = e.item(0);
  }

  fileReadNew(e: FileList, i: number) {
    let temp: File = e.item(0);
    console.log(temp.type == 'image/*');
    if(temp && temp.name.split(".")[1] != 'jpg')
      this.sB.open('Sorry, only .jpg extension is allowed');
    else
      this.submissions[i] = e.item(0);
  }

  uploadSubmissionNew(i: number) {
    if(confirm(`Upload Image ${i}?`)) {
      this.loading = true;
      this.uS.submitNew(this.submissions[i-1], this.userData.uploaded ? 'edit' : 'new',i).subscribe(
        result => {
          this.loading = false;
          this.sB.open(result.message);
          this.submissions[i-1] = undefined;
          if(result.status) {
            this.userData.submissions[i-1] = this.submitImageNames[i-1];
            localStorage.setItem('user',JSON.stringify(this.userData));
            this.ngOnInit();
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

  deleteSubmissionNew(i: number) {
    if(confirm(`Delete Image ${i}?`)) {
      this.loading = true;
      this.uS.deleteNew('delete',i).subscribe(
        result => {
          this.loading = false;
          this.sB.open(result.message);
          if(result.status) {
            this.userData.submissions[i-1] = "";
            localStorage.setItem('user',JSON.stringify(this.userData));
            this.ngOnInit();
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

  downloadSubmission() {
    window.open(this.currentSubmission);
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
