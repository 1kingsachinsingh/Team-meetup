import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateMeetingComponent } from './create-meeting/create-meeting.component';
import { UpdateMeetingComponent } from './update-meeting/update-meeting.component';

import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { DragAndDropModule } from 'angular-draggable-droppable';

import { Ng2SearchPipeModule } from 'ng2-search-filter';
import {  NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    DragAndDropModule.forRoot(),
    Ng2SearchPipeModule,
    NgbModalModule.forRoot(),

    
  ],
  declarations: [CreateMeetingComponent, UpdateMeetingComponent]
})
export class MeetingModule { }
 