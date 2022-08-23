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
import { format, isSameDay, parseISO } from 'date-fns';
import { ProviderModel } from 'src/app/models/provider.model';
import { Subscription } from 'rxjs';
import { ServiceModel } from 'src/app/models/service.mode';
import { Timestamp } from '@angular/fire/firestore';
import { SlotConfigModel } from 'src/app/models/slotsconfig.model';
import { BookingModel } from 'src/app/models/booking.model';
import { DateModel } from 'src/app/models/date.model';
import { SlotService } from 'src/app/services/slot.service';
import { SlotModel } from 'src/app/models/slot.model';

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
  dayCount = 1;
  availableSlots = new Map();
  slotDate;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestoreService: FirestoreService,
    private slotService: SlotService
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
    this.slotDate = date;
    const bookingDate = new DateModel({
      start: date.key,
      end: date.key + this.selectedService.duration * this.config.slotSeconds,
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

    const slotsDay1 = [];
    const slotsDay2 = [];
    const dayMillis1 = this.slotDate.value.dayMillis;
    const dayMillis2 = this.slotDate.value.dayMillis + 1000 * 60 * 60 * 24;
    for (let i = this.selectedDate.start; i < this.selectedDate.end; i += this.config.slotSeconds
    ) {
      if (isSameDay(i, this.selectedDate.start)) {
        slotsDay1.push(i - dayMillis1);
      } else {
        slotsDay2.push(i - dayMillis2);
      }
    }

    const slotmodels = [];
    if (slotsDay1.length > 0) {
      const slot1 = new SlotModel({
        dayMillis: dayMillis1,
        slotsMillis: slotsDay1,
      });
      slotmodels.push(slot1);
    }

    if (slotsDay2.length > 0) {
      const slot2 = new SlotModel({
        dayMillis: dayMillis2,
        slotsMillis: slotsDay2,
      });
      slotmodels.push(slot2);
    }

    await this.firestoreService.createBooking(booking, slotmodels);

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

  async calendarChange(value) {
    const dateTime = parseISO(value);

    if (this.observableSlots) {
      this.observableSlots.unsubscribe();
    }

    this.observableSlots = this.firestoreService
      .streamSlotsByProvider(this.selectedProvider, dateTime, this.dayCount)
      .subscribe((bookedSlots) => {
        this.availableSlots = this.slotService.getAvailableSlots(
          dateTime,
          bookedSlots,
          this.dayCount,
          this.selectedService.duration,
          this.config
        );
      });
  }
}
