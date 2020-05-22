import { Component, OnInit } from '@angular/core';
import { CommonService } from '../services/common.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private uS: UserService, private cS: CommonService, private router: Router, private tS: Title, private sB: MatSnackBar)
   { tS.setTitle('Strokes | Home') }

  username: string;
  password: string;
  loading: boolean = true;
  registration: boolean = false;
  settings = {
    "title": "Cannot Fetch INFO",
    "description": "Cannot Fetch INFO",
    "startTime": "Cannot Fetch INFO",
    "endTime": "Cannot Fetch INFO",
    "registration_ends": "",
    "banner": ""
  };

  ngOnInit() {
    if(localStorage.getItem('token'))
      this.router.navigateByUrl('mysubmission');
    else
      this.cS.getSettings().subscribe(
        result => {
          this.loading = false;
          if(!result.status) {
            this.sB.open('Strokes details could not be fetched.. Try reloading the page :/');
            return;
          }
          this.settings.title = result.data.title;
          this.settings.description = result.data.description;
          this.settings.banner = result.data.banner == 'NA' ? 'Cannot Fetch INFO' : environment.apiUrl + '/common/getBanner/' + result.data.banner;
          this.settings.startTime = new Date(result.data.startTime).toString();
          this.settings.endTime = new Date(result.data.endTime).toString();
          this.settings.registration_ends = new Date(result.data.registration_ends).toString();
          this.registration = new Date(result.data.registration_ends).getTime() >= new Date(result.serverDate).getTime();
        },
        problem => {
          this.loading = false;
          console.log(problem.error);
          this.sB.open(problem.error instanceof ProgressEvent ? 'Failed Connecting the Server. Check your Internet Connection or Try again later' : problem.error.message);
        }
      );
  }

  login(e: any) {
    this.loading = true;
    this.uS.login({ username: this.username, password: this.password }).subscribe(
      result => {
        this.loading = false;
        if(result.status) {
          this.sB.open('Login Successfull !!!');
          e.reset();
          localStorage.setItem('token',result.token);
          if(result.user.admin)
            localStorage.setItem('admin','hackcurbrain');
          delete result.user['admin'];
          delete result.user['password'];
          localStorage.setItem('user',JSON.stringify(result.user));
          this.router.navigateByUrl('mysubmission');
        }
        else
          this.sB.open(result.message);
      },
      problem => {
        this.loading = false;
        console.log(problem.error);
        this.sB.open(problem.error instanceof ProgressEvent ? 'Failed Connecting the Server. Check your Internet Connection or Try again later' : problem.error.message);
      }
    );
  }

}
