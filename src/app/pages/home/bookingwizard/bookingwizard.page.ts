import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { Timestamp } from '@angular/fire/firestore';
import { SlotConfigModel } from 'src/app/models/slotsconfig.model';
import { BookingModel } from 'src/app/models/booking.model';
import { DateModel } from 'src/app/models/date.model';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-bookingwizard',
  templateUrl: './bookingwizard.page.html',
  styleUrls: ['./bookingwizard.page.scss'],
})
export class BookingwizardPage implements OnInit, OnDestroy {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('calendar') calendar: IonDatetime;

  selectedService: ServiceModel;
  selectedProvider: ProviderModel;
  selectedDate: DateModel;
  services: ServiceModel[] = [];
  providers: ProviderModel[] = [];
  currentSlide = 0;
  observableProviders: Subscription = Subscription.EMPTY;
  observableServices: Subscription = Subscription.EMPTY;
  observableSlots: Subscription = Subscription.EMPTY;
  config: SlotConfigModel;
  availableSlots = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestoreService: FirestoreService
  ) {}

  async ngOnInit() {
    this.config = await this.firestoreService.getSlotConfig();
    this.observableServices = this.firestoreService
      .streamAllServices()
      .subscribe((data) => {
        this.services = data;
      });
  }

  ngOnDestroy() {
    this.observableProviders.unsubscribe();
    this.observableServices.unsubscribe();
    this.observableSlots.unsubscribe();
  }

  abort() {
    this.observableProviders.unsubscribe();
    this.observableServices.unsubscribe();
    this.observableSlots.unsubscribe();
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  back() {
    this.currentSlide--;
    this.slides.slidePrev();
  }

  next() {
    this.currentSlide++;
    this.slides.slideNext();
  }

  chooseProviderSlide(service: ServiceModel) {
    this.observableServices.unsubscribe();
    this.selectedService = service;
    this.observableProviders = this.firestoreService
      .streamProvidersByService(service)
      .subscribe((data) => {
        this.providers = data;
      });
    this.next();
  }

  chooseDateSlide(provider: ProviderModel) {
    this.observableProviders.unsubscribe();
    if (provider === null) {
      // Beliebig
    }
    this.selectedProvider = provider;
    this.next();
  }

  async confirmSlide() {
    this.observableSlots.unsubscribe();
    const bookingDate = new DateModel({
      start: 1 * 60 * 60 * 24 * 1000,
      end: 2 * 60 * 60 * 24 * 1000,
    });
    this.selectedDate = bookingDate;
    this.next();
  }

  async confirmBooking() {
    const booking = new BookingModel({
      date: this.selectedDate,
      provider: this.selectedProvider,
      service: this.selectedService,
    });

    const res = await this.firestoreService.createBooking(booking);

    if (res === false) {
      return;
    }

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

  getSlotsOfWeekDay(weekDay: string): number[] {
    let slots: number[];
    switch (weekDay) {
      case '1':
        slots = this.config.sun;
        break;
      case '2':
        slots = this.config.mon;
        break;
      case '3':
        slots = this.config.tue;
        break;
      case '4':
        slots = this.config.wed;
        break;
      case '5':
        slots = this.config.thu;
        break;
      case '6':
        slots = this.config.fri;
        break;
      case '7':
        slots = this.config.sat;
        break;
    }
    return slots;
  }

  async calendarChange(value) {
    const selectedDateTime = parseISO(value);
    const weekDay = format(selectedDateTime, 'e');
    const configSlots = []; //this.getSlotsOfWeekDay(weekDay);

    for (let i = 0; i < 86400000; i += 3600000) {
      configSlots.push(i);
    }

    console.log(configSlots);

    if (this.observableSlots) {
      this.observableSlots.unsubscribe();
    }

    this.observableSlots = this.firestoreService
      .streamSlotsByProvider(this.selectedProvider, selectedDateTime, 1)
      .subscribe((slots) => {
        this.availableSlots = [];
        console.log(slots);

        const freeSlots = [];
        let configSlotTimestamp;
        for (const configSlot of configSlots) {
          let isfree = true;
          // Check if slot is full
          for (const fullSlot of slots) {
            for (const slotSeconds of fullSlot.slotSeconds) {
              configSlotTimestamp = Timestamp.fromMillis(
                fullSlot.daySeconds + configSlot
              );
              const fullSlotTimestamp = Timestamp.fromMillis(
                fullSlot.daySeconds + slotSeconds
              );
              if (configSlotTimestamp.isEqual(fullSlotTimestamp)) {
                isfree = false;
              }
            }
          }
          if (isfree === true) {
            const date = format(configSlotTimestamp.toMillis(), 'HH:mm');
            freeSlots.push(date);
          }
          // Check if duration fit in slots
          const totalDuration =
            this.selectedService.duration * this.config.slotSeconds;
          // ...
        }

        this.availableSlots = freeSlots;
      });
  }
}
