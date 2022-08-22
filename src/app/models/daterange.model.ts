import { Timestamp } from '@angular/fire/firestore';

export class DateRangeModel {
  public day: Timestamp;
  public slots: Timestamp[];

  constructor(day: Timestamp, slots: Timestamp[]) {
    this.day = day;
    this.slots = slots;
  }
}
