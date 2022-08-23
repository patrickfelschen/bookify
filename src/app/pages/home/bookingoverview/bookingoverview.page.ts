import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingModel } from 'src/app/models/booking.model';

@Component({
  selector: 'app-bookingoverview',
  templateUrl: './bookingoverview.page.html',
  styleUrls: ['./bookingoverview.page.scss'],
})
export class BookingoverviewPage implements OnInit {

  currentBooking: BookingModel;

  constructor(private router: Router) {
    if(this.router.getCurrentNavigation().extras.state) {
      this.currentBooking = this.router.getCurrentNavigation().extras.state.currentBooking;
    }
  }

  ngOnInit() {

  }
}
