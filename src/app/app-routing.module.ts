import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { MysubmissionComponent } from './mysubmission/mysubmission.component';
import { UserListComponent } from './user-list/user-list.component';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { SettingsComponent } from './settings/settings.component';
import { ErrorpageComponent } from './errorpage/errorpage.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AccountComponent } from './account/account.component';
import { UserFilesComponent } from './user-files/user-files.component';
import { DownloadComponent } from './download/download.component';
import { CertificateComponent } from './certificate/certificate.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'mysubmission', component: MysubmissionComponent, canActivate: [UserGuard] },
  { path: 'account', component: AccountComponent, canActivate: [UserGuard] },
  { path: 'userlist', component: UserListComponent, canActivate: [AdminGuard] },
  { path: 'userfiles', component: UserFilesComponent, canActivate: [AdminGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AdminGuard] },
  { path: 'downloadsection', component: DownloadComponent, canActivate: [AdminGuard] },
  { path: 'resetpassword', component: ResetPasswordComponent, canActivate: [AdminGuard] },
  { path: 'certificate', component: CertificateComponent, canActivate: [AdminGuard] },
  { path: '**', component: ErrorpageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
