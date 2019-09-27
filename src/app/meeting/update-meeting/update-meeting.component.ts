import { Component, OnInit } from '@angular/core';

import { AppService } from '../../app.service';
import { SocketService } from '../../socket.service';

//import for toastr
import { ToastrService } from 'ngx-toastr';
//import for Routing
import { ActivatedRoute, Router } from '@angular/router';
//for cookies
import { Cookie } from 'ng2-cookies/ng2-cookies';



@Component({
  selector: 'app-update-meeting',
  templateUrl: './update-meeting.component.html',
  styleUrls: ['./update-meeting.component.css']
})
export class UpdateMeetingComponent implements OnInit {
  public selectedUser: any;

  public meetingDetails: any;
  public meetingId: any;
  public subject: any;
  public description: any;
  public startDate1: any;
  public endDate1: any;
  public venue: any;
  public participantId:any;


  public userInfo: any;
  public authToken: any;
  public receiverId: any;
  public receiverName: any;
  public adminName: any;

  constructor(
    public appService: AppService,
    public socketService: SocketService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,

  ) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.receiverId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
    this.adminName = Cookie.get('receiverName');

    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    this.meetingId = this._route.snapshot.paramMap.get('meetingId');

    if(this.userInfo.isAdmin == 'true'){
      this.getMeetingDetailsFunction(this.meetingId, this.authToken) ;
    }else{
      this.router.navigate(['/user/normal/meeting/dashboard']);      
    }


  
  }

  public validateDate(startDate:any, endDate:any):boolean {//method to validate the the start and end date of meeting .

    let start = new Date(startDate);
    let end = new Date(endDate);

    if(end < start){
      return true;
    }
    else{
      return false;
    }

  }//end validateDate


  public validateCurrentDate(startDate:any):boolean {//method to validate the current date and date of meeting .

    let start = new Date(startDate);
    let end : any = new Date();

    if(end > start){
      return true;
    }
    else{
      return false;
    }

  }//end validateDate

  public goToAdminDashboard(): any {
    this.router.navigate(['/user/admin/meeting/dashboard']);
  }//end of goToAdminDashboard function

  public getMeetingDetailsFunction = (meetingId, authToken) => {//this function will get meeting details. 

    this.appService.getMeetingDetails(meetingId, authToken).subscribe(//using the api get metting details.
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.meetingDetails = apiResponse.data;
          this.toastr.info("Meeting Details Captured ", "Meeting Found!");

          //console.log(this.meetingDetails)
          this.participantId = this.meetingDetails.participantId
          this.subject = this.meetingDetails.meetingTopic;
          this.description = this.meetingDetails.meetingDescription;
          this.startDate1 = new Date(this.meetingDetails.meetingStartDate);
          this.endDate1 = new Date(this.meetingDetails.meetingEndDate);
          this.venue = this.meetingDetails.meetingPlace;
          this.selectedUser = this.meetingDetails.participantName;          
        }
        else {
          this.toastr.error(apiResponse.message,"Error!");
        }
      },
      (error) => {
        if (error.status == 404) {
          this.toastr.warning("Meeting Not Found", "");
        }
        else {
          this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/serverError']);

        }
      }
    );
  }//end getAllUsers


  public updateMeetingFunction(): any {

    if (!this.subject) {
      this.toastr.warning("Subject is required", "Warning!");
    }
    else if (!this.description) {
      this.toastr.warning("Description is required", "Warning!");
    }
    else if (!this.startDate1) {
      this.toastr.warning("Start Date/Time is required", "Warning!");
    }
    else if (!this.endDate1) {
      this.toastr.warning("End Date/Time is required", "Warning!");
    }
    else if (!this.venue) {
      this.toastr.warning("Venue is required", "Warning!");
    }
    else if (this.validateDate(this.startDate1 ,this.endDate1)) {
      this.toastr.warning("End Date/Time cannot be before Start Date/Time", "Warning!");
    }
    else if (this.validateCurrentDate(this.startDate1) && this.validateCurrentDate(this.endDate1)) {
      this.toastr.warning("Meeting can't be schedule in back date/time", "Warning!");
    }
    else {
      let data = {
        meetingId: this.meetingId,
        meetingTopic: this.subject,
        meetingDescription:this.description,
        meetingStartDate:this.startDate1.getTime(),
        meetingEndDate:this.endDate1.getTime(),
        meetingPlace:this.venue,
        authToken:this.authToken
      }
  
      console.log(data)  
      this.appService.updateMeeting(data)
        .subscribe((apiResponse) => {
  
          if (apiResponse.status == 200) {
            this.toastr.success("We emailed the final schedule to participant", "Meeting Rescheduled");
            

            let dataForNotify = {
              message: `Hi, ${this.receiverName} has reschedule the Meeting - ${data.meetingTopic}. Please check your Calendar/Email`,
              userId:this.participantId
            }
  
            this.notifyUpdatesToUser(dataForNotify);
            
            setTimeout(() => {
              this.goToAdminDashboard();
            }, 1000);//redirecting to admin dashboard page
  
          }
          else {
            this.toastr.error(apiResponse.message, "Error!");
          }
        },
          (error) => {
            if(error.status == 400){
              this.toastr.warning("Meeting Schedule Failed", "One or more fields are missing");
            }
            else{
              this.toastr.error("Some Error Occurred", "Error!");
              this.router.navigate(['/serverError']);
  
            }
        });//end calling updatemeeting
    }
    }//end updatemeeting function
  
    /* Events based Functions */

  //emitted 

public notifyUpdatesToUser: any = (data) => {
  //data will be object with message and userId(recieverId)
  this.socketService.notifyUpdates(data);

}//end notifyUpdatesToUser

}
