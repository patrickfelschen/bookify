import { Injectable } from '@angular/core';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { BookingModel } from '../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {

  constructor(private calendar: Calendar) {}

  async createBookingEvent(booking: BookingModel) {
    this.calendar
      .createEventInteractively(
        booking.service.description,
        '',
        booking.provider.email,
        booking.date.startDate,
        booking.date.endDate
      )
      .then(
        (msg) => {
          console.log(msg);
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
