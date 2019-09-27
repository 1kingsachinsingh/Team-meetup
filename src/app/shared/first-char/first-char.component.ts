import { Component, OnChanges, Input, EventEmitter, Output, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'first-char',
  templateUrl: './first-char.component.html',
  styleUrls: ['./first-char.component.css']
})
export class FirstCharComponent implements OnInit,OnChanges {

  @Input() userName: string;
  @Input() userBg: string;
  @Input() userColor: string;

  public firstChar: string;
  private _name:string = '';

  @Output()
  notify: EventEmitter<String> = new EventEmitter<String>();



  ngOnInit(): void {
      this._name = this.userName;
      this.firstChar = this._name[0];

  } // end ngOnInit


  ngOnChanges(changes: SimpleChanges){
    let name  = changes.userName;
    this._name = name.currentValue;
    this.firstChar = this._name[0];
  }


  nameClicked(){
    this.notify.emit(this._name);
  }
}
