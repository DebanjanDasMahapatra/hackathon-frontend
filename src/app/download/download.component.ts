import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AdminService } from '../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {

  constructor(private aS: AdminService, private cS: CommonService, private router: Router,
    private sB: MatSnackBar, private tS: Title) { tS.setTitle('Strokes | Download Section | ADMIN') }
  
  @ViewChild('allData', {static: true}) table: ElementRef;

  loading: boolean = true;
  downloadData = {
    "key": "",
    "size": "",
    "apiRes": false
  };
  url = environment.apiUrl + "/admin/downloadall/";
  userData;
  usersData;

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('user'));
    this.getUsers();
  }

  getUsers() {
    this.usersData = undefined;
    this.aS.fetchUsers().subscribe(
      result => {
        if(result.status) {
          this.usersData = result.user;
          this.usersData.forEach(userr => {
            userr.createdAt = new Date(userr.createdAt).toString().replace('GMT+0530 (India Standard Time)','Hrs IST');
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

  downloadControl(start: boolean) {
    if(confirm(`${start ? 'Start Zipping' : 'Sure to Prepare Download'}?`)) {
      this.loading = true;
      let call: Observable<any>;
      if(!start)
        call = this.aS.prepare();
      else
        call = this.aS.startDownload();
      call.subscribe(
        result => {
          this.loading = false;
          this.sB.open(result.message);
          if(start && result.status)
            this.downloadData = result.data;
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
  }

  exportToExcel()
  {
    const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All_Data");
    XLSX.writeFile(wb, 'Participant_Database.xlsx');
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
