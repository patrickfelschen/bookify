import { Timestamp } from '@angular/fire/firestore';

export class DateRangeModel {
  public day: number;
  public slots: number[];

  constructor(day: number, slots: number[]) {
    this.day = day;
    this.slots = slots;
  }
}
