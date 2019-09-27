
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { isSameDay,isSameMonth } from 'date-fns';

import { CalendarEvent, CalendarEventTimesChangedEvent} from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';

import { Subject } from 'rxjs';


import { AppService } from '../../app.service';
import { SocketService } from '../../socket.service';


import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';


const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  },

  green: {
    primary: '#008000',
    secondary: '#FDF1BA'
  }

  
};

 
@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})

export class UserDashboardComponent implements OnInit {
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalAlert') modalAlert: TemplateRef<any>;

  view: string = 'month';

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };
 
  refresh: Subject<any> = new Subject();

  activeDayIsOpen: boolean = false;

  public userInfo: any;
  public authToken: any;
  public receiverId: any;
  public receiverName: any;
  public meetings: any = [];
  public events: CalendarEvent[] = [];
  public remindMe: any;


  constructor(
    private modal: NgbModal,
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
    this.remindMe = true
 
    this.userInfo = this.appService.getUserInfoFromLocalStorage()

    if(this.userInfo.isAdmin == 'false'){

      this.verifyUserConfirmation()
      this.authErrorFunction(); 
      this.getUserAllMeetingFunction();
      this.getUpdatesFromAdmin();
    }
    else{
      this.router.navigate(['/user/normal/meeting/dashboard']);      

    }
    
    setInterval(() => {
      this.meetingReminder();// function to send the reminder to the user
    }, 5000);//will check for every two minutes

  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        //this.activeDayIsOpen = true;
        this.view = 'day'
      }
    }
  }

  eventTimesChanged({event,newStart,newEnd}: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {
    //console.log(event)
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  public meetingReminder(): any {
    let currentTime = new Date().getTime();
    //console.log(this.meetings)
    for (let meetingEvent of this.meetings) {

      if (isSameDay(new Date(), meetingEvent.start) && new Date(meetingEvent.start).getTime() - currentTime <= 60000
        && new Date(meetingEvent.start).getTime() > currentTime) {
        if (meetingEvent.remindMe) {

          this.modalData = { action: 'clicked', event: meetingEvent };
          this.modal.open(this.modalAlert, { size: 'sm' });

          break;
        }//end inner if

      }//end if
      else if(currentTime > new Date(meetingEvent.start).getTime() && 
      new Date(currentTime - meetingEvent.start).getTime()  < 10000){
        this.toastr.info(`Meeting ${meetingEvent.meetingTopic} Started!`, `Gentle Reminder`);
      }  
    }

  }//end of meetingReminder function

 
  /* Database Functions */


  public getUserAllMeetingFunction = () => {//this function will get all the meetings of User. 
    this.appService.getUserAllMeeting(this.receiverId,this.authToken).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {

          this.meetings = apiResponse.data;
          //console.log(this.meetings)

          for(let meetingEvent of this.meetings) {
              meetingEvent.title =  meetingEvent.meetingTopic;
              meetingEvent.start = new Date(meetingEvent.meetingStartDate);
              meetingEvent.end = new Date(meetingEvent.meetingEndDate);
              meetingEvent.color = colors.green;
              meetingEvent.remindMe = true

            }
          this.events = this.meetings;
          this.refresh.next();
    
          this.toastr.info("Calendar Updated", "Meetings Found!");
          //console.log(this.events)
  
        }
        else {
          this.toastr.error(apiResponse.message,"Error!");
          this.events = [];
        }
      },
      (error) => {
        if(error.status == 400){
          this.toastr.warning("Calendar Failed to Update", "Either user or Meeting not found");
          this.events = []
        }
        else{
          this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/serverError']);

        }
     }
    );
    }//end getAllUserMeetings
  
  public logoutFunction = () => {

      this.appService.logout(this.receiverId,this.authToken).subscribe(
        (apiResponse) => {
          if (apiResponse.status === 200) {
            localStorage.clear();
            Cookie.delete('authToken');//delete all the cookies
            Cookie.delete('receiverId');
            Cookie.delete('receiverName');
            //Cookie.delete('arrayOfIds');
            this.socketService.disconnectedSocket();//calling the method which emits the disconnect event.
            this.socketService.exitSocket();//this method will disconnect the socket from frontend and close the connection with the server.
            this.router.navigate(['/user/login']);//redirects the user to login page.
          } else {
            this.toastr.error(apiResponse.message,"Error!")
            //this.router.navigate(['/serverError']);//in case of error redirects to error page.
          } // end condition
        },
        (err) => {
          if(err.status == 404){
            this.toastr.warning("Logout Failed", "Already Logged Out or Invalid User");
          }
          else{
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/serverError']);
  
          }
      });
  
  }//end logout  
   
  
      /* Event based functions */

    //listened
    public verifyUserConfirmation: any = () => {
      this.socketService.verifyUser()
        .subscribe(() => {
          this.socketService.setUser(this.authToken);//in reply to verify user emitting set-user event with authToken as parameter.
  
        });//end subscribe
    }//end verifyUserConfirmation
  
    public authErrorFunction: any = () => {
      
      this.socketService.listenAuthError()
        .subscribe((data) => {
          console.log(data)

        
  
        });//end subscribe
    }//end authErrorFunction

  
    public getUpdatesFromAdmin= () =>{

      this.socketService.getUpdatesFromAdmin(this.receiverId).subscribe((data) =>{//getting message from admin.
        this.getUserAllMeetingFunction();
        this.toastr.info("Update From Admin!",data.message);
      });
    }
  
}


