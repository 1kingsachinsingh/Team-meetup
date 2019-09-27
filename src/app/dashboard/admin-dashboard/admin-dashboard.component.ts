import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';

import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';

import { Subject } from 'rxjs';

import { AppService } from '../../app.service';
import { SocketService } from '../../socket.service';

import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';


const colors: any = {
  green: {
    primary: '#008000',
    secondary: '#FAE3E3'
  }
};

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})



export class AdminDashboardComponent implements OnInit {
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalConfirmation') modalConfirmation: TemplateRef<any>;
  @ViewChild('modalAlert') modalAlert: TemplateRef<any>;

  view: string = 'month';

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-pencil-alt"></i>       ',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fas fa-trash-alt"></i>        ',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = false;

  public selectedUser: any;
  public allUsers: any[];
  public allUsersData: any[];
  public userInfo: any;
  public authToken: any;
  public receiverId: any;
  public receiverName: any;
  public adminId: any;
  public adminName: any;

  public onlineUserList: any = []
  public meetings: any = [];
  public events: CalendarEvent[] = [];

  public gentleReminder: Boolean = true;


  constructor(
    public appService: AppService,
    public socketService: SocketService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    private modal: NgbModal,

  ) {

  }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.receiverId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    this.adminId = Cookie.get('receiverId');
    this.adminName = Cookie.get('receiverName');
    
    //console.log(this.userInfo)
    if(this.userInfo.isAdmin == 'true'){
      this.verifyUserConfirmation()
      this.getOnlineUserList()
      this.getAllUsers();
  
      this.getUserAllMeetingFunction()
      this.authErrorFunction()      
    }
    else{
      this.router.navigate(['/user/normal/meeting/dashboard']);      
    }

    setInterval(() => {
      this.meetingReminder();// function to send the reminder to the user
    }, 5000); //will check for every 5 seconds

  }


  /* Calendar Events */

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      //console.log('Day CLicked')
      this.viewDate = date;
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        //this.activeDayIsOpen = true;
        this.view = 'day'
      }
    }
  }


  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: any): void {
    //console.log(event)

    if (action === 'Edited') {
      this.router.navigate([`/user/admin/meeting/update/${event.meetingId}`]);
    }

    else if (action === 'Deleted') {
      console.log(action === 'Deleted')

      this.modalData = { event, action };
      this.modal.open(this.modalConfirmation, { size: 'sm' });

    }
    else {
      this.modalData = { event, action };
      this.modal.open(this.modalContent, { size: 'lg' });
    }
  }

  deleteEvent(event: any): void {
    //console.log("Deleted...")

    this.deleteMeetingFunction(event);

    this.events = this.events.filter(iEvent => iEvent !== event);
    this.refresh.next();
    this.activeDayIsOpen = false;
  }

/* End Calendar Events */

  public goToAddMeeting(): any {
    this.router.navigate(['/user/admin/meeting/create']);
  }//end of goToAddMeeting function

 
  public meetingReminder(): any {
    let currentTime = new Date().getTime();
    //console.log(this.meetings)
    for (let meetingEvent of this.meetings) {

      if (isSameDay(new Date(), meetingEvent.start) && new Date(meetingEvent.start).getTime() - currentTime <= 60000
        && new Date(meetingEvent.start).getTime() > currentTime) {
        if (meetingEvent.remindMe && this.gentleReminder) {

          this.modalData = { action: 'clicked', event: meetingEvent };
          this.modal.open(this.modalAlert, { size: 'sm' });
          this.gentleReminder = false
          break;
        }//end inner if

      }//end if
      else if(currentTime > new Date(meetingEvent.start).getTime() && 
      new Date(currentTime - meetingEvent.start).getTime()  < 10000){
        this.toastr.info(`Meeting ${meetingEvent.meetingTopic} Started!`, `Gentle Reminder`);
      }  
    }

  }//end of meetingReminder function


  /* Data base functions */

  public getUserMeetings(userId,userName): any { //get meetings of clicked user ; 
    this.receiverId = userId
    this.receiverName = userName
    this.getUserAllMeetingFunction()
  }//end of getUserMeetings function

  public getAdminMeetings(userId): any { //get meetings of admin
    this.receiverId = userId
    this.receiverName = this.adminName
    this.getUserAllMeetingFunction()
  }//end of getAdminMeetings function

  public getAllUsers = () => {//this function will get all the normal users from database. 

    if (this.authToken != null) {
      this.appService.getUsers(this.authToken).subscribe((apiResponse) => {
        if (apiResponse.status == 200) {
          this.allUsersData = apiResponse.data;

          this.toastr.info("Updated", "All users listed");

        }
        else {
          this.toastr.error(apiResponse.message, "User Update");
        }
      },
        (error) => {
          this.toastr.error('Server error occured', "Error!");
          this.router.navigate(['/serverError']);

        }//end error
      );//end getusers

    }//end if
    else {
      this.toastr.info('Missing Authorization key', "Please login again");
      this.router.navigate(['/user/login']);

    }//end else

  }//end getAllUsers

  public sentMeetingRemindersonEmailFunction = () => {//this function will get all the normal users from database. 

    if (this.authToken != null && this.adminId != null) {
      this.appService.sentMeetingReminders(this.adminId,this.authToken).subscribe((apiResponse) => {
        if (apiResponse.status == 200) {
          this.toastr.info("Meeting Reminders sent", "Update");

        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
        }
      },
        (error) => {
          this.toastr.error('Server error occured', "Error!");
          this.router.navigate(['/serverError']);

        }//end error
      );//end sentreminders

    }//end if
    else {
      this.toastr.info('Missing Authorization key', "Please login again");
      this.router.navigate(['/user/login']);

    }//end else

  }//end sentRemindersFunction
 
  public getUserAllMeetingFunction = () => {//this function will get all the meetings of User. 
    
    if (this.receiverId != null && this.authToken != null) {
      this.appService.getUserAllMeeting(this.receiverId, this.authToken).subscribe((apiResponse) => {
        if (apiResponse.status == 200) {

          this.meetings = apiResponse.data;

          //console.log(this.meetings)
          for (let meetingEvent of this.meetings) {
            meetingEvent.title = meetingEvent.meetingTopic;
            meetingEvent.start = new Date(meetingEvent.meetingStartDate);
            meetingEvent.end = new Date(meetingEvent.meetingEndDate);
            meetingEvent.color = colors.green;
            meetingEvent.actions = this.actions
            meetingEvent.remindMe = true
            
          }
          this.events = this.meetings;
          //console.log(this.events)
          this.refresh.next();

          this.toastr.info("Calendar Updated", `Meetings Found!`);
          //console.log(this.events)

        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
          this.events = [];
        }
      },
        (error) => {
          if (error.status == 400) {
            this.toastr.warning("Calendar Failed to Update", "Either user or Meeting not found");
            this.events = []
          }
          else {
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/serverError']);

          }
        }//end error
      );//end appservice.getuserallmeeting

    }//end if
    else {
      this.toastr.info("Missing Authorization Key", "Please login again");
      this.router.navigate(['/user/login']);

    }

  }//end getUserAllMeetingFunction


  public deleteMeetingFunction(meeting): any {
    this.appService.deleteMeeting(meeting.meetingId, this.authToken)
      .subscribe((apiResponse) => {

        if (apiResponse.status == 200) {
          this.toastr.success("Deleted the Meeting", "Successfull!");

          let dataForNotify = {
            message: `Hi, ${this.receiverName} has canceled the meeting - ${meeting.meetingTopic}. Please Check your Calendar/Email`,
            userId: meeting.participantId
          }

          this.notifyUpdatesToUser(dataForNotify);

        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
        }
      },
        (error) => {

          if (error.status == 404) {
            this.toastr.warning("Delete Meeting Failed", "Meeting Not Found!");
          }
          else {
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/serverError']);

          }

        });//end calling deletemeeting

  }//end deletemeeting

  public logoutFunction = (userId) => {
    this.appService.logout(userId, this.authToken).subscribe(
      (apiResponse) => {
        if (apiResponse.status === 200) {
          
          Cookie.delete('authToken');//delete all the cookies
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          
          localStorage.clear();
          
          this.socketService.disconnectedSocket();//calling the method which emits the disconnect event.
          this.socketService.exitSocket();//this method will disconnect the socket from frontend and close the connection with the server.


          setTimeout(() => {
            this.router.navigate(['/user/login']);//redirects the user to login page.
          }, 1000);//redirecting to Dashboard page


        } else {
          this.toastr.error(apiResponse.message, "Error!")
          this.router.navigate(['/serverError']);//in case of error redirects to error page.
        } // end condition
      },
      (err) => {
        if (err.status == 404) {
          this.toastr.warning("Logout Failed", "Already Logged Out or Invalid User");
        }
        else {
          this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/serverError']);

        }
      });

  }//end logout  


  /* Socket - Event Based Functions */

  //listened
  public verifyUserConfirmation: any = () => {
    this.socketService.verifyUser()
      .subscribe(() => {
        //console.log("In verifys")
        this.socketService.setUser(this.authToken);//in reply to verify user emitting set-user event with authToken as parameter.

      });//end subscribe
  }//end verifyUserConfirmation

  public authErrorFunction: any = () => {

    this.socketService.listenAuthError()
      .subscribe((data) => {
        this.toastr.info("Missing Authorization Key", "Please login again");
        this.router.navigate(['/user/login']);
  
      });//end subscribe
  }//end authErrorFunction

  public getOnlineUserList: any = () => {
    this.socketService.onlineUserList()
      .subscribe((data) => {

        this.onlineUserList = []
        for (let x in data) {
          //let temp = { 'userId': x, 'userName': data[x] };
          this.onlineUserList.push(x);
        }

        for (let user of this.allUsersData) {

          if (this.onlineUserList.includes(user.userId)) {
            user.status = "online"
          } else {
            user.status = "offline"
          }

        }

      });//end subscribe
  }//end getOnlineUserList


  //emitted 

  public notifyUpdatesToUser: any = (data) => {
    //data will be object with message and userId(recieverId)
    this.socketService.notifyUpdates(data);

  }//end notifyUpdatesToUser


}
