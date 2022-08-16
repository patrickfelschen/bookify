import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private router: Router,
  ) { }


  profile() {
    this.router.navigateByUrl('profile', { replaceUrl: true });
  }

  bookingOverview() {
    this.router.navigateByUrl('bookingoverview', {replaceUrl: true});
  }

  newBooking() {
    this.router.navigateByUrl('bookingwizard', { replaceUrl: true });
  }
}
