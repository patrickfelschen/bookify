import { Component, OnInit, ViewChild } from '@angular/core';
import SwiperCore, {
  Autoplay,
  Keyboard,
  Pagination,
  Scrollbar,
  Zoom,
} from 'swiper';
import { IonDatetime, IonicSlides, IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { format, parseISO,  } from 'date-fns';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-bookingwizard',
  templateUrl: './bookingwizard.page.html',
  styleUrls: ['./bookingwizard.page.scss'],
})
export class BookingwizardPage implements OnInit {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('calendar') calendar: IonDatetime;

  selectedService;
  selectedProvider;
  services = [];
  providers = [];
  bookings = [];
  currentSlide = 0;
  observableProviders;
  observableServices;
  observableBookings;
  bookingConfig;
  weekSlots = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestoreService: FirestoreService,
  ) {
    this.observableServices = this.firestoreService.getAllServices().subscribe((data) => {
      this.services = data;
    });
  }

  async ngOnInit() {
    this.bookingConfig = await this.firestoreService.getBookingConfig();
  }

  abort() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  back() {
    this.currentSlide--;
    this.slides.slidePrev();
  }

  chooseProviderSlide(service) {
    this.observableServices.unsubscribe();
    this.selectedService = service;
    this.observableProviders = (this.firestoreService.getProvidersByService(this.selectedService)).subscribe((data) => {
      this.providers = data;
    });
    this.currentSlide++;
    this.slides.slideNext();
  }

  async chooseDateSlide(provider) {
    this.observableProviders.unsubscribe();
    this.selectedProvider = provider;
    if(provider === null) {
      // Beliebig
    }
    this.observableBookings = (this.firestoreService.getBookingsByProvider(this.selectedProvider)).subscribe((data) => {
      this.bookings = data;
    });
    this.currentSlide++;
    this.slides.slideNext();
  }

  confirmSlide() {
    this.observableBookings.unsubscribe();
    this.currentSlide++;
    this.slides.slideNext();
  }

  async confirmBooking() {
    const alert = await this.alertController.create({
      header: 'Termin speichern?',
      message:
        'Soll der Termin automatisch in den Telefon Kalender übertragen werden?',
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: () => {
            this.router.navigateByUrl('home', { replaceUrl: true });
          },
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
            this.router.navigateByUrl('home', { replaceUrl: true });
          },
        },
      ],
    });

    await alert.present();
  }

  getSlotsOfWeekDay(weekDay) {
    let slots;
    switch (weekDay) {
      case '1':
        slots = this.bookingConfig.sun;
        break;
      case '2':
        slots = this.bookingConfig.mon;
        break;
      case '3':
        slots = this.bookingConfig.tue;
        break;
      case '4':
        slots = this.bookingConfig.wed;
        break;
      case '5':
        slots = this.bookingConfig.thu;
        break;
      case '6':
        slots = this.bookingConfig.fri;
        break;
      case '7':
        slots = this.bookingConfig.sat;
        break;
    }
    return slots;
  }

  calendarChange(value) {
    const weekDay = format(parseISO(value), 'e');
    this.weekSlots = this.getSlotsOfWeekDay(weekDay);
    console.log(this.weekSlots);
  }
}
