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
import { format, parseISO } from 'date-fns';
import { ProviderModel } from 'src/app/models/provider.model';
import { Subscription } from 'rxjs';
import { ServiceModel } from 'src/app/models/service.mode';
import { BookingConfigModel } from 'src/app/models/bookingconfig.model';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-bookingwizard',
  templateUrl: './bookingwizard.page.html',
  styleUrls: ['./bookingwizard.page.scss'],
})
export class BookingwizardPage implements OnInit {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('calendar') calendar: IonDatetime;

  selectedService: ServiceModel;
  selectedProvider: ProviderModel;
  services = [];
  providers = [];
  currentSlide = 0;
  observableProviders: Subscription;
  observableServices: Subscription;
  observableBookings: Subscription;
  bookingConfig: BookingConfigModel;
  openSlots = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestoreService: FirestoreService
  ) { }

  async ngOnInit() {
    this.bookingConfig = await this.firestoreService.getBookingConfig();
    this.observableServices = this.firestoreService
    .streamAllServices()
    .subscribe((data) => {
      this.services = data;
    });
  }

  abort() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  back() {
    this.currentSlide--;
    this.slides.slidePrev();
  }

  chooseProviderSlide(service: ServiceModel) {
    this.observableServices.unsubscribe();
    this.selectedService = service;
    this.observableProviders = this.firestoreService
      .streamProvidersByService(this.selectedService)
      .subscribe((data) => {
        this.providers = data;
      });
    this.currentSlide++;
    this.slides.slideNext();
  }

  async chooseDateSlide(provider: ProviderModel) {
    this.observableProviders.unsubscribe();
    if (provider === null) {
      // Beliebig
    }
    this.selectedProvider = provider;
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

  getSlotsOfWeekDay(weekDay: string) {
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

  async calendarChange(value) {
    const dateTime = parseISO(value);
    const date = format(dateTime, 'yyyy-MM-dd');
    const weekDay = format(dateTime, 'e');
    const dayTimeSlots = this.getSlotsOfWeekDay(weekDay);

    if (this.observableBookings) {
      this.observableBookings.unsubscribe();
    }

    this.observableBookings = this.firestoreService
      .streamBookingsByProvider(this.selectedProvider, new Date(date))
      .subscribe((data) => {
        //TODO:
        console.log(data);
      });
    console.log(date);
  }
}
