import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { AdminService } from '../services/admin.service';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private aS: AdminService, private cS: CommonService, private router: Router,
    private sB: MatSnackBar, private tS: Title) { tS.setTitle('Strokes | Settings | ADMIN') }

  userData;
  settings = {
    "title": "",
    "description": "",
    "startTime": "",
    "endTime": "",
    "registration_ends": "",
    "banner": ""
  };
  loading: boolean = true;
  checkOut: number;
  bannerPhoto: File;
  bannerUrl: string = '';
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '200px',
    placeholder: 'Enter Competition Description Here...',
    toolbarHiddenButtons: [
      ['justifyLeft','justifyCenter','justifyRight','justifyFull','indent','outdent'],
      ['backgroundColor','insertImage','insertVideo','customClasses']
    ]
  };

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.checkOut = new Date().getTimezoneOffset();
    this.getSettings(true);
  }

  getSettings(initial: boolean, msg: string = '') {
    this.cS.getSettings().subscribe(
      result => {
        this.loading = false;
        if(!initial)
          this.sB.open(msg);
        this.settings.title = result.data.title;
        this.settings.description = result.data.description;
        this.settings.banner = result.data.banner;
        if(this.settings.banner != 'NA')
          this.bannerUrl = environment.apiUrl+'/common/getBanner/'+result.data.banner; 
        let date: Date;
        date = new Date(result.data.registration_ends);
        this.settings.registration_ends = this.convertLTZDatetoISOString(date);
        date = new Date(result.data.startTime);
        this.settings.startTime = this.convertLTZDatetoISOString(date);
        date = new Date(result.data.endTime);
        this.settings.endTime = this.convertLTZDatetoISOString(date);
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

  func(e) {
    console.log(e);
    
  }

  fileRead(e: FileList) {
    this.bannerPhoto = e.item(0);
  }

  convertISOStringtoLTZDate(date: string): Date {
    let newDate: Date = new Date(date+':00.000');
    return newDate;
  }

  convertLTZDatetoISOString(date: Date): string {
    let newDate: Date = new Date(date);
    newDate.setMinutes(date.getMinutes()-this.checkOut);
    return newDate.toISOString().slice(0,16);
  }

  saveSettings(file: boolean, data: boolean) {
    this.loading = true;
    if(data) {
      this.settings.startTime = this.convertISOStringtoLTZDate(this.settings.startTime).toString();
      this.settings.endTime = this.convertISOStringtoLTZDate(this.settings.endTime).toString();
    }
    this.setSettings(file,data);
  }

  setSettings(file: boolean, data: boolean) {
    this.aS.setSettings(file ? this.bannerPhoto : undefined, data ? this.settings : undefined).subscribe(
      result => {
        if(result.status) {
          if(file && data) {
            this.bannerPhoto = undefined;
            this.resetSettings();
          }
          if(file)
            this.bannerPhoto = undefined;
          else if(data)
            this.resetSettings();
          this.bannerUrl = undefined;
          this.settings.banner = 'NA';
          this.getSettings(false,result.message);
        }
        else
          this.sB.open(result.message);
      },
      problem => {
        this.loading = false;
          console.log(problem.error);
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

  resetSettings() {
    this.settings.title = "";
    this.settings.description = "";
    this.settings.startTime = "";
    this.settings.endTime = "";
    this.settings.banner = "";
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
