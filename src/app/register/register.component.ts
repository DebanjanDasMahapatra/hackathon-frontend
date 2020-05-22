import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../User';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  loading: boolean = true;
  user = new User;
  errors = {
    username: false,
    email: false,
    password: false
  }
  checkEmail = [];
  checkUsername = [];
  temp: string = "";
  temp2: string = "";
  deadline: string = "";
  photo: File = undefined;
  idcard: File = undefined;
  registration: boolean = false;

  constructor(private cS: CommonService, private uS: UserService, private router: Router, private sB: MatSnackBar,
    private tS: Title) { tS.setTitle('Strokes | Register') }

  ngOnInit() {
    this.getChecks();
  }

  register(e: any) {
    if(this.registration) {
      if(confirm('Sure to Register?')) {
        this.loading = true;
        if(this.user.yoc == 'Other')
          this.user.yoc = this.temp;
        if(this.user.itype == 'SCHOOL')
          this.user.stream = "";
        this.uS.register(this.user,this.photo,this.idcard).subscribe(
          result => {
            this.loading = false;
            if(result.status) {
              e.reset();
              this.router.navigateByUrl('/home');
            }
            this.sB.open(result.message);
          },
          problem => {
            this.loading = false;
            console.log(problem.error);
            this.sB.open(problem.error instanceof ProgressEvent ? 'Failed Connecting the Server. Check your Internet Connection or Try again later' : problem.error.message);
          }
        );
      }
    } else
    this.sB.open('Sorry, Registration has closed');
  }

  fileRead(e: FileList, type: boolean) {
    if(type)
      this.photo = e.item(0);
    else
      this.idcard = e.item(0);
  }

  isRedundant(arg: boolean) {
    if(arg) {
      this.errors.username = this.checkUsername.indexOf(this.user.username) != -1;
    } else {
      this.errors.email = this.checkEmail.indexOf(this.user.email) != -1;
    }
  }

  compare() {
    if(this.temp2 != this.user.password && this.temp2 != "")
      this.errors.password = true;
    else
      this.errors.password = false;
  }

  getChecks() {
    this.cS.getSettings().subscribe(
      result => {
        if(!result.status) {
          this.sB.open('Strokes details could not be fetched.. Try reloading the page :/');
          this.router.navigateByUrl('/home');
          return;
        }
        this.deadline = new Date(result.data.registration_ends).toString();
        this.registration = new Date(result.data.registration_ends).getTime() >= new Date(result.serverDate).getTime();
        if(this.registration)
          this.uS.fetchUserNameEmailList().subscribe(
            result => {
              this.loading = false;
              if(result.status) {
                for(let i=0;i<result.user.length;i++)
                {
                  this.checkEmail.push(result.user[i].email);
                  this.checkUsername.push(result.user[i].username);
                }          
              }
              else
                this.sB.open(result.message);
            },
            problem => {
              this.loading = false;
              console.log(problem.error);
              this.sB.open(problem.error instanceof ProgressEvent ? 'Failed Connecting the Server. Check your Internet Connection or Try again later' : problem.error.message+" | Try reloading the page.");
              this.router.navigateByUrl('/home');
            }
          );
        else
          this.loading = false;
      },
      problem => {
        this.loading = false;
        console.log(problem.error);
        this.sB.open(problem.error instanceof ProgressEvent ? 'Failed Connecting the Server. Check your Internet Connection or Try again later' : problem.error.message);
        this.router.navigateByUrl('/home');
      }
    );
    
  }
}
