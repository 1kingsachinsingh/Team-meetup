import { Injectable } from '@angular/core';

//Added for Http and Observables
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import * as io from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public baseUrl = "http://localhost:3000";
  public socket;

  constructor(private _http: HttpClient) {
    //console.log("SocketService is called");
    //handshake is happening
    this.socket = io(this.baseUrl);

  }

    //events that has to be listen
    public verifyUser = () => {
      return Observable.create((observer) => {
        this.socket.on('verifyUser', (data) => {
          observer.next(data);
        });//On method
      });//end observable
    }//end verifyUser
  
    public onlineUserList = () => {
      return Observable.create((observer) => {
        this.socket.on('online-user-list', (userList) => {
          observer.next(userList);
        });//end On method
      });//end observable
  
    }//end onlineUserList
  
    public disconnect = () => {
      return Observable.create((observer) => {
        this.socket.on('disconnect', () => {
          observer.next();
        });//end On method
      });//end observable
  
    }//end disconnect

    public listenAuthError = () => {
      return Observable.create((observer) => {
        this.socket.on('auth-error', (data) => {
          observer.next(data);
        }); // end Socket
      }); // end Observable
    } // end listenAuthError
      
    public getUpdatesFromAdmin = (userId) => {
      return Observable.create((observer) => {
        this.socket.on(userId, (data) => {
          observer.next(data);
        }); // end Socket
      }); // end Observable
    } // end getUpdatesFromAdmin

    //* Events that are emitted *//


  public setUser = (authToken) => {
    this.socket.emit('set-user', authToken);
  }


  public notifyUpdates = (data) => {
    this.socket.emit('notify-updates', data);
  }

  public exitSocket = () =>{
    this.socket.disconnect();
  }// end exit socket

  public disconnectedSocket = () => {

      this.socket.emit("disconnect", "");//end Socket

  }//end disconnectedSocket


}
