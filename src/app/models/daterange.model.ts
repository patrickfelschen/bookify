import { Timestamp } from '@angular/fire/firestore';

export class DateRangeModel {
  public start: Timestamp;
  public end: Timestamp;

  constructor(start: Timestamp, end: Timestamp) {
    this.start = start;
    this.end = end;
  }
}
