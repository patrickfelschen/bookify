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
import { BookingConfigModel } from 'src/app/models/bookingconfig.model';
import { Timestamp } from '@angular/fire/firestore';
import { WeekDay } from '@angular/common';

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
  services: ServiceModel[] = [];
  providers: ProviderModel[] = [];
  currentSlide = 0;
  observableProviders: Subscription = Subscription.EMPTY;
  observableServices: Subscription = Subscription.EMPTY;
  observableBookings: Subscription = Subscription.EMPTY;
  bookingConfig: BookingConfigModel;
  availableSlots = [];
  blockedSlots = [];
  dayCount = 1;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestoreService: FirestoreService
  ) {}

  async ngOnInit() {
    this.bookingConfig = await this.firestoreService.getBookingConfig();
    this.observableServices = this.firestoreService
      .streamAllServices()
      .subscribe((data) => {
        this.services = data;
      });
  }

  ngOnDestroy() {
    this.observableProviders.unsubscribe();
    this.observableServices.unsubscribe();
    this.observableBookings.unsubscribe();
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

    if (this.observableBookings) {
      this.observableBookings.unsubscribe();
    }

    this.observableBookings = this.firestoreService
      .streamBookingsByProvider(this.selectedProvider, dateTime, this.dayCount)
      .subscribe((bookings) => {
        // Alle möglichen Slots des Tages (falls dayCount > 0 auch Slots der nächsten Tage)
        this.availableSlots = this.getDayTimeSlots(dateTime, this.dayCount);
        this.blockedSlots = [];

        // Falls Bookings vorhanden
        if(bookings.length) {
          // Belegte Slots
          for(const booking of bookings) {
            const dayInSeconds = booking.date.day;
            for(const bookingSlot of booking.date.slots) {
              this.blockedSlots.push(dayInSeconds + bookingSlot);
            }
          }

          // Belegte Slots von verfügbaren abziehen
          let slotBlocked = false;
          for(let i = 0; i < this.availableSlots.length; i++) {
            // console.log('Slot: ' + new Date(this.availableSlots[i]));
            for(const blockedTimestamp of this.blockedSlots) {
              // console.log('Blocked: ' + new Date(blockedTimestamp));
              if(this.availableSlots[i] === blockedTimestamp) {
                slotBlocked = true;
              }
            }
            if(slotBlocked) {
              // console.log('Treffer');
              this.availableSlots.splice(i, 1);
              i--; // Beim Löschen wird nächstes Element nachgeschoben, i dekrementieren, verhindert Überspringen des Elementes
            }
            slotBlocked = false;
            // console.log('------------------');
          }
        }

        this.availableSlots = this.filterDuration();
        this.availableSlots = this.convertTimestampsToHours(dateTime);
      });
  }

  filterDuration() {
    let consecutiveSlots = 0;
    const slotSize = this.bookingConfig.slotSeconds;
    const final = [];

    // Alle übrigen Slots
    for (let i = 0; i < this.availableSlots.length; i++) {
      // console.log('Current: ' + new Date(this.availableSlots[i]).toLocaleTimeString());
      // Schleife von aktuellem Slot bis Slot + Länge der Dienstleistung
      for (let j = i; j < i + this.selectedService.duration; j++) {
        const currentTimestamp = this.availableSlots[j];
        const nextTimestamp = this.availableSlots[j + 1];

        // console.log('Next: ' + new Date(this.availableSlots[j + 1]).toLocaleTimeString());

        // Wenn aktueller Timestamp + die Länge eines Zeitslots = dem nächsten Timestamp sind, gibt es zwischen diesen keine Unterbrechung
        if (currentTimestamp + slotSize === nextTimestamp) {
          consecutiveSlots++;
        } else {
          break;
        }
      }

      // Prüfen, ob genug zusammenhängende Slots für die gewählte Dienstleistung gefunden wurden
      if (consecutiveSlots >= this.selectedService.duration) {
        final.push(this.availableSlots[i]);
      }
      // console.log('Consecutive slots: ' + consecutiveSlots);
      // console.log('---------------------------');
      consecutiveSlots = 0;
    }

    return final;
  }

  getDayTimeSlots(dateTime, dayCount) {
    // Gewählter Wochentag (1 - 7)
    const weekday = parseInt(format(dateTime, 'e'));
    const timestamp = Timestamp.fromDate(dateTime);
    const dayInMs = 86400000; // Millisekunden eines Tages
    const slots = [];
    let tmp = [];

    for(let i = 0; i <= dayCount; i++) {
      // Index für die Slots der nächsten Tage. Modulo Rechnung um Werte von 1 - 7 zu erhalten
      const index = ((weekday + i)  - 1) % 7 + 1;
      tmp = this.getSlotsOfWeekDay(index.toString());

      for(const slot of tmp) {
        slots.push(((timestamp.toMillis() + slot) + (i * dayInMs)));
      }
    }

    return slots;
  }

  sameDay(timestamp1: Timestamp, timestamp2: Timestamp) {
    const date1 = new Date(timestamp1.toMillis());
    const date2 = new Date(timestamp2.toMillis());

    if(date1.toDateString() === date2.toDateString()) {
      return true;
    }
    else {
      return false;
    }
  }

  convertTimestampsToHours(currentDay) {
    const tmp = [];
    for(const t of this.availableSlots) {
      // Nur freie Zeiten vom aktuellen Tag (gewählt im Kalender) werden angezeigt
      if(this.sameDay(Timestamp.fromDate(currentDay), Timestamp.fromMillis(t))) {
        const date = new Date(t);
        const time = date.toLocaleTimeString();
        tmp.push(time);
      }
    }

    return tmp;
  }
}
