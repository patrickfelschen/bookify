import { Component, ViewChild  } from '@angular/core';
import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { IonDatetime, IonicSlides, IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-bookingservice',
  templateUrl: './bookingservice.page.html',
  styleUrls: ['./bookingservice.page.scss'],
})

export class BookingservicePage {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('calendar') calendar: IonDatetime;

  currentSlide = 0;

  constructor(
    private router: Router,
    ) { }

  abort() {
    this.router.navigateByUrl('home', {replaceUrl: true});
  }

  back() {
    this.currentSlide--;
    this.slides.slidePrev();
  }

  chooseProviderSlide() {
    this.currentSlide++;
    this.slides.slideNext();
  }

  chooseDateSlide() {
    this.currentSlide++;
    this.slides.slideNext();
  }

  confirmSlide() {
    this.currentSlide++;
    this.slides.slideNext();
  }

  confirmBooking() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  calendarChange($event) {
    console.log(this.calendar.value);
  }
}
