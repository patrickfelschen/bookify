import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookingservice',
  templateUrl: './bookingservice.page.html',
  styleUrls: ['./bookingservice.page.scss'],
})
export class BookingservicePage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  abort() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

}
