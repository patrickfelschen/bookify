import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BookingModel } from 'src/app/models/booking.model';
import { FakeDataService } from 'src/app/services/fake-data.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SplashScreen } from '@capacitor/splash-screen';


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
    private firestoreService: FirestoreService,
    private fakedataService: FakeDataService
  ) {}

  async ngOnInit() {
    // Prüfen ob ein User Profil bereits existiert
    const userExists = await this.firestoreService.userProfileExists();
    if (userExists === false) {
      // Profil muss erstellt werden
      this.router.navigateByUrl('completeprofile', { replaceUrl: true });
    }
    await SplashScreen.hide();
    this.observableFutureBookings = this.firestoreService.streamFutureBooking().subscribe(bookings =>{
      this.futureBookings = bookings;
    });
    this.observablePastBookings = this.firestoreService.streamPastBooking().subscribe(bookings =>{
      this.pastBookings = bookings;
    });
  }

  async ionViewWillEnter() {
    await SplashScreen.hide();
  }

  ngOnDestroy(): void {
    this.observableFutureBookings.unsubscribe();
    this.observablePastBookings.unsubscribe();
  }

  profile(): void {
    // this.fakedataService.generateProviders(80);
    // this.fakedataService.createSlotConfig();
    this.router.navigateByUrl('profile');
  }

  bookingOverview(booking): void {
    this.router.navigateByUrl('bookingoverview', { state: { currentBooking: booking } });
  }

  newBooking(): void {
    this.router.navigateByUrl('bookingwizard');
  }
}
