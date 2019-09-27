import { Component, OnInit } from '@angular/core';

//import for toastr
import { ToastrService } from 'ngx-toastr';
//for Service
import { AppService } from '../../app.service';
//for routing
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  public validationToken:any;
  public password:any;
  public confirmPassword:any;
  constructor(
    public appService: AppService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService

  ) { }

  ngOnInit() {
    this.validationToken = this._route.snapshot.paramMap.get('validationToken');

  }

  public goToSignIn(): any {
    this.router.navigate(['/user/login']);
  }//end of goToSign function

  public updatePasswordFunction(): any {
    if (!this.password) {
      this.toastr.warning("Password is required", "Warning!");
    }
    else if (!this.confirmPassword) {
      this.toastr.warning("Confirm Password is required", "Warning!");
    }
    else{
      let data = {
        validationToken: this.validationToken,
        password: this.password,
      }
  
      this.appService.updatePassword(data)
        .subscribe((apiResponse) => {
  
  
          if (apiResponse.status == 200) {
            this.toastr.success("Please login", "Password Updated!");
            setTimeout(() => {
              this.goToSignIn();
            }, 1000);//redirecting to signIn page

          }
          else {
            this.toastr.error(apiResponse.message, "Error!");
          }
        },
          (error) => {
            if(error.status == 404){
              this.toastr.warning("Password Update failed", "Please request another password reset!");
            }
            else{
              this.toastr.error("Some Error Occurred", "Error!");
              this.router.navigate(['/serverError']);
  
            }
              
          });//end calling signUpFunction
  
    }
  
}//end signUp function

}
