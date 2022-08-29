import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BookingModel } from 'src/app/models/booking.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  observableFutureBookings: Subscription = Subscription.EMPTY;
  observablePastBookings: Subscription = Subscription.EMPTY;

  futureBookings: BookingModel[];
  pastBookings: BookingModel[];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.observableFutureBookings = this.firestoreService.streamFutureBooking().subscribe(bookings =>{
      this.futureBookings = bookings;
    });
    this.observablePastBookings = this.firestoreService.streamPastBooking().subscribe(bookings =>{
      this.pastBookings = bookings;
    });
  }

  ngOnDestroy(): void {
    this.observableFutureBookings.unsubscribe();
    this.observablePastBookings.unsubscribe();
  }

  profile(): void {
    this.router.navigateByUrl('profile');
  }

  bookingOverview(booking): void {
    this.router.navigateByUrl('bookingoverview', { state: { currentBooking: booking } });
  }

  newBooking(): void {
    this.router.navigateByUrl('bookingwizard');
  }
}
