import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';


import { FirstCharComponent } from './first-char/first-char.component';
import { MyNavComponent } from './my-nav/my-nav.component';
import { MyCoverComponent } from './my-cover/my-cover.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [ FirstCharComponent, MyNavComponent, MyCoverComponent],
  exports: [
    FirstCharComponent,
    MyNavComponent,
    MyCoverComponent,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
