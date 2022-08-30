import { Timestamp } from '@angular/fire/firestore';
import { format } from 'date-fns';

/**
 * Klasse für Start und Ende einer Buchung
 */
export class DateModel {
  public start: number;
  public end: number;

  constructor({ start, end }) {
    this.start = start;
    this.end = end;
  }

  get startDate() {
    return new Date(this.start);
  }

  get endDate() {
    return new Date(this.end);
  }

  getStartTimeString() {
    return format(new Date(this.start), 'dd.MM.yyyy HH:mm');
  }

  getEndTimeString() {
    return format(new Date(this.end), 'dd.MM.yyyy HH:mm');
  }
}
