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
import { format, parse, parseISO } from 'date-fns';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-bookingwizard',
  templateUrl: './bookingwizard.page.html',
  styleUrls: ['./bookingwizard.page.scss'],
})
export class BookingwizardPage {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('calendar') calendar: IonDatetime;

  selectedService;
  services = [];
  providers = [];
  currentSlide = 0;
  observableProviders;
  observableServices;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestoreService: FirestoreService,
  ) {
    this.observableServices = this.firestoreService.getAllServices().subscribe((data) => {
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

  chooseProviderSlide(service) {
    this.observableServices.unsubscribe();
    this.selectedService = service;
    this.observableProviders = (this.firestoreService.getProvidersByService(this.selectedService)).subscribe((data) => {
      this.providers = data;
    });

    this.currentSlide++;
    this.slides.slideNext();
  }

  chooseDateSlide() {
    this.observableProviders.unsubscribe();

    this.currentSlide++;
    this.slides.slideNext();
  }

  confirmSlide() {
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

  calendarChange(value) {
    const formattedDate = format(parseISO(value), 'HH:mm, MMM dd YYY');
    console.log(formattedDate);
  }
}
