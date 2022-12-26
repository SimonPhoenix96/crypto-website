import { Component, OnInit } from '@angular/core';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

 
  constructor() {}

  ngOnInit(): void {
  }


}