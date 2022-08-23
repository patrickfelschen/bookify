import { Timestamp } from '@angular/fire/firestore';

export class DateModel {
  public start: number;
  public end: number;

  constructor({start, end}) {
    this.start = start;
    this.end = end;
  }
}
