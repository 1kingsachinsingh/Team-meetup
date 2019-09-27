import { Component, OnInit } from '@angular/core';

//import for toastr
import { ToastrService } from 'ngx-toastr';
//for Service
import { AppService } from '../../app.service';
//for routing
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  public userId:string;


  constructor(
    public appService: AppService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService

  ) { }

  ngOnInit() {
    this.userId = this._route.snapshot.paramMap.get('userId');
    this.verifyEmailFunction()
  }

  public verifyEmailFunction(): any {

      this.appService.verifyEmail(this.userId)
        .subscribe((apiResponse) => {

          if (apiResponse.status == 200) {
            this.toastr.success("Please login", "Email Verified!");
          }
          else {
            this.toastr.error(apiResponse.message, "Error!");
          }
        },
          (error) => {
            if(error.status == 404){
              this.toastr.warning("Email Verification failed", "User Not Found!");
            }
            else{
              this.toastr.error("Some Error Occurred", "Error!");
              this.router.navigate(['/serverError']);
  
            }
              
          });//end calling signUpFunction
    
  }//end signUp function

}
