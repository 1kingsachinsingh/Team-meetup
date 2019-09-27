import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import {RouterModule ,Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './user/login/login.component';
import { SignupComponent } from './user/signup/signup.component';
import { ForgotPasswordComponent } from './user/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './user/verify-email/verify-email.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { CreateMeetingComponent } from './meeting/create-meeting/create-meeting.component';
import { UpdateMeetingComponent } from './meeting/update-meeting/update-meeting.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './dashboard/user-dashboard/user-dashboard.component';


const routes: Routes = [
  {path :'user/login',component:LoginComponent},
  {path :'user/signup',component:SignupComponent},
  {path :'user/forgot-password', component:ForgotPasswordComponent},
  {path :'user/verify-email/:userId', component:VerifyEmailComponent},
  {path :'user/reset-password/:validationToken', component:ResetPasswordComponent},
  {path :'user/normal/meeting/dashboard',component:UserDashboardComponent},


  {path :'user/admin/meeting/create',component:CreateMeetingComponent},
  {path :'user/admin/meeting/update/:meetingId',component:UpdateMeetingComponent},
  {path :'user/admin/meeting/dashboard',component:AdminDashboardComponent},


  {path :'serverError', component:ServerErrorComponent},
  {path : '', redirectTo:'user/login',pathMatch:'full'},
  {path :'*',component:PageNotFoundComponent},
  {path :'**',component:PageNotFoundComponent}

];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes) ,

  ],
  exports:[
    RouterModule
  ],

  declarations: []
})
export class AppRoutingModule { }
