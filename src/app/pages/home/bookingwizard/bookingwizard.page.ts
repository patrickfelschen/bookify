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
  availableSlots = new Map();
  blockedSlots = [];
  dayCount = 1;

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

  async confirmSlide(date) {
    this.observableSlots.unsubscribe();
    const bookingDate = new DateModel({
      start: date,
      end: date + (this.selectedService.duration * this.config.slotSeconds),
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
    const dateTime = parseISO(value);

    if (this.observableSlots) {
      this.observableSlots.unsubscribe();
    }

    this.observableSlots = this.firestoreService
      .streamSlotsByProvider(this.selectedProvider, dateTime, this.dayCount)
      .subscribe((slots) => {
        // Alle möglichen Slots des Tages (falls dayCount > 0 auch Slots der nächsten Tage)
        this.availableSlots = this.getDayTimeSlots(dateTime, this.dayCount);
        this.blockedSlots = [];

        // Falls Bookings vorhanden
        if(slots.length) {
          // Belegte Slots
          for(const slot of slots) {
            const dayInSeconds = slot.dayMillis;
            for(const bookingSlot of slot.slotsMillis) {
              this.blockedSlots.push(dayInSeconds + bookingSlot);
            }
          }

          // Belegte Slots von verfügbaren abziehen
          // let slotBlocked = false;
          for(const key of this.availableSlots.keys()) {
            // console.log('Slot: ' + new Date(slotKey));
            for(const blockedTimestamp of this.blockedSlots) {
              // console.log('Blocked: ' + new Date(blockedTimestamp));
              if(key === blockedTimestamp) {
                this.availableSlots.get(key).blocked = true;
                break;
              }
            }
            // slotBlocked = false;
            // console.log('------------------');
          }
        }
        this.filterDuration(dateTime);
        // console.log(this.availableSlots);
        // this.convertTimestampsToHours(dateTime);
      });
  }

  filterDuration(dateTime) {
    let consecutiveSlots = 0;
    const slotMillis = (this.selectedService.duration * this.config.slotSeconds);

    // Alle übrigen Slots
    for (const key of this.availableSlots.keys()) {
      if(this.availableSlots.get(key).blocked === true) {
        continue;
      }
      // console.log('Current: ' + new Date(key).toLocaleTimeString());
      // Schleife von aktuellem Slot bis Slot + Länge der Dienstleistung
      for (let j = key; j < (key + slotMillis); j += this.config.slotSeconds) {
        // console.log('Next: ' + new Date(j + this.config.slotSeconds).toLocaleTimeString());
        // Wenn aktueller Timestamp + die Länge eines Zeitslots = dem nächsten Timestamp sind, gibt es zwischen diesen keine Unterbrechung
        const element = this.availableSlots.get(j + this.config.slotSeconds);
        if (element !== undefined && element.blocked === false) {
          consecutiveSlots++;
        } else {
          break;
        }
      }

      // Prüfen, ob genug zusammenhängende Slots für die gewählte Dienstleistung gefunden wurden
      if (!(consecutiveSlots >= this.selectedService.duration)) {
        this.availableSlots.get(key).blocked = true;
      }
      if(!this.sameDay(key, Timestamp.fromDate(dateTime).toMillis())) {
        // console.log('delete: ' + new Date(key));
        this.availableSlots.delete(key);
      }
      // console.log('Consecutive slots: ' + consecutiveSlots);
      // console.log('---------------------------');
      consecutiveSlots = 0;
    }
  }

  getDayTimeSlots(dateTime, dayCount) {
    // Gewählter Wochentag (1 - 7)
    const weekday = parseInt(format(dateTime, 'e'));
    const timestamp = Timestamp.fromDate(dateTime);
    const dayInMs = 86400000; // Millisekunden eines Tages
    const slots = new Map();
    let tmp = [];

    for(let i = 0; i <= dayCount; i++) {
      // Index für die Slots der nächsten Tage. Modulo Rechnung um Werte von 1 - 7 zu erhalten
      const index = ((weekday + i)  - 1) % 7 + 1;
      tmp = this.getSlotsOfWeekDay(index.toString());

      for(const slot of tmp) {
        const key = ((timestamp.toMillis() + slot) + (i * dayInMs));
        slots.set(key, {blocked: false, timeString: new Date(key).toLocaleTimeString()});
      }
    }

    return slots;
  }

  sameDay(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    if(date1.toDateString() === date2.toDateString()) {
      return true;
    }
    else {
      return false;
    }
  }

  convertTimestampsToHours(currentDay) {
    const tmp = [];
    for(const [slotKey, slotValue] of this.availableSlots) {
      // Nur freie Zeiten vom aktuellen Tag (gewählt im Kalender) werden angezeigt
      if(this.sameDay(Timestamp.fromDate(currentDay), Timestamp.fromMillis(slotKey))) {
        const date = new Date(slotKey);
        const time = date.toLocaleTimeString();
        tmp.push(date);
      }
    }

    return tmp;
  }
}
