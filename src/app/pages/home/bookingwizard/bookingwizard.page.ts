import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import SwiperCore, {
  Autoplay,
  Keyboard,
  Pagination,
  Scrollbar,
  Zoom,
} from 'swiper';
import { IonContent, IonDatetime, IonicSlides, IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { add, isSameDay, parseISO } from 'date-fns';
import { ProviderModel } from 'src/app/models/provider.model';
import { Subscription } from 'rxjs';
import { ServiceModel } from 'src/app/models/service.mode';
import { SlotConfigModel } from 'src/app/models/slotsconfig.model';
import { BookingModel } from 'src/app/models/booking.model';
import { DateModel } from 'src/app/models/date.model';
import { SlotService } from 'src/app/services/slot.service';
import { SlotModel } from 'src/app/models/slot.model';
import { CalendarService } from 'src/app/services/calendar.service';
import { Capacitor } from '@capacitor/core';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-bookingwizard',
  templateUrl: './bookingwizard.page.html',
  styleUrls: ['./bookingwizard.page.scss'],
})
export class BookingwizardPage implements OnInit, OnDestroy {
  @ViewChild('content') content: IonContent;
  @ViewChild('slides') ionSlides: IonSlides;
  @ViewChild('calendar') ionDatetime: IonDatetime;

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
  calendarDate: string;
  today: Date = new Date();

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestoreService: FirestoreService,
    private slotService: SlotService,
    private calendarService: CalendarService
  ) {
    const tomorrow = add(this.today, { days: 1 });
    // Dient als initialer Wert des Kalenders
    this.calendarDate = tomorrow.toISOString();
  }

  async ngOnInit() {
    // Abrufen der Konfiguration
    this.config = await this.firestoreService.getSlotConfig();
    // Abrufen verfügbarer Dienstleistungen
    this.observableServices = this.firestoreService
      .streamAllServices()
      .subscribe((data) => {
        this.services = data;
      });
    // Festlegen der Zeitspanne des Kalenders
    const max = add(this.today, { years: 2 });
    this.ionDatetime.min = this.today.toISOString();
    this.ionDatetime.max = max.toISOString();
  }

  /**
   * Abmelden von Live-Daten beim Schließen des Screens
   */
  ngOnDestroy() {
    this.observableProviders.unsubscribe();
    this.observableServices.unsubscribe();
    this.observableSlots.unsubscribe();
  }

  /**
   * Bricht den Buchungsvorgang ab und navigiert zurück zum Home Screen
   */
  abort() {
    this.observableProviders.unsubscribe();
    this.observableServices.unsubscribe();
    this.observableSlots.unsubscribe();
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  /**
   * Zurück navigieren
   */
  back() {
    this.currentSlide--;
    this.ionSlides.slidePrev();
    this.content.scrollToTop();
  }

  /**
   * Vorwärts navigieren
   */
  next() {
    this.currentSlide++;
    this.ionSlides.slideNext();
    this.content.scrollToTop();
  }

  /**
   * Setzt die gewählte Dienstleistung und ruft verfügbare Dienstleister ab
   *
   * @param service Gewählter Service
   */
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

  /**
   * @param min Untere Grenze
   * @param max Obere Grenze
   * @returns Zufällige Ganzzahl zwischeh min und max
   */
  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Setzt den gewählten Dienstleister und öffnet Kalenderübersicht
   *
   * @param provider Gewählter Dienstleister
   */
  chooseDateSlide(provider: ProviderModel) {
    this.observableProviders.unsubscribe();
    if (provider === null) {
      // Zufällig
      const index = this.getRandomInt(0, this.providers.length);
      this.selectedProvider = this.providers[index];
      console.log(index);
    } else {
      this.selectedProvider = provider;
    }
    this.calendarChange(this.calendarDate);
    this.next();
  }

  /**
   * Setzt den gewählen Termin und öffnet Gesamtübersicht
   *
   * @param date Gewähltes Datum
   */
  async confirmSlide(date) {
    this.observableSlots.unsubscribe();
    this.slotDate = date;
    const bookingDate = new DateModel({
      start: date.key,
      end: date.key + this.selectedService.duration * this.config.slotMillis,
    });
    this.selectedDate = bookingDate;
    this.next();
  }

  /**
   * Eintragen der Buchung in Firestore
   */
  async confirmBooking() {
    // Erstellen eines neuen Bookings mit den gewählten Daten
    const booking = new BookingModel({
      date: this.selectedDate,
      provider: this.selectedProvider,
      service: this.selectedService,
    });

    // Berechnung der gewählten Zeitslots
    const slotsDay1 = [];
    const slotsDay2 = [];
    const dayMillis1 = this.slotDate.value.dayMillis;
    const dayMillis2 = this.slotDate.value.dayMillis + 1000 * 60 * 60 * 24;
    // Falls Termin über zwei Tage geht, sind zwei Arrays mit zugehörigen Slots notwendig
    for (
      let i = this.selectedDate.start;
      i < this.selectedDate.end;
      i += this.config.slotMillis
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

    // Speicher Buchung im User und belegte Slots im Provider
    await this.firestoreService.createBooking(booking, slotmodels);

    // Ermöglicht speichern des Termin in Smartphone Kalender Anwendung
    if (Capacitor.isNativePlatform()) {
      const alert = await this.alertController.create({
        header: 'Termin speichern?',
        message:
          'Soll der Termin automatisch in den Telefon Kalender übertragen werden?',
        buttons: [
          {
            text: 'Ja',
            role: 'confirm',
            handler: () => {
              this.calendarService.createBookingEvent(booking);
              this.router.navigateByUrl('home', { replaceUrl: true });
            },
          },
          {
            text: 'Nein',
            role: 'cancel',
            handler: () => {
              this.router.navigateByUrl('home', { replaceUrl: true });
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.router.navigateByUrl('home', { replaceUrl: true });
    }
  }

  /**
   * Reagiert auf Kalenderänderungen
   *
   * @param value Gewähltes Datum als ISO-String
   */
  async calendarChange(value) {
    const dateTime = parseISO(value);

    if (this.observableSlots) {
      this.observableSlots.unsubscribe();
    }

    this.observableSlots = this.firestoreService
      .streamSlotsByProvider(this.selectedProvider, dateTime, this.dayCount)
      .subscribe((bookedSlots) => {
        console.log(bookedSlots);
        this.availableSlots = this.slotService.getAvailableSlots(
          dateTime,
          bookedSlots,
          this.dayCount,
          this.selectedService.duration,
          this.config
        );
      });
  }

  /**
   * Stellt nur die Tage im Kalender zur Auswahl, die in Zukunft liegen
   *
   * @param dateString Kalendertag
   * @returns true - Tag liegt in Zukunft, false - Tag liegt in Vergangenheit
   */
  isValidDay(dateString: string) {
    return new Date(dateString) >= new Date();
  }

  /**
   * Bringt die Dauer der Dienstleistung in geeignetes Format
   *
   * @param duration Dauer der Dienstleistung in Millisekunden
   * @returns Dauer der Diensleitung in Stunden/Minuten
   */
  calculateDuration(duration: number) {
    if (this.config == null) {
      return;
    }
    const hours = (duration * this.config.slotMillis) / 1000 / 60 / 60;
    if (hours < 1) {
      return hours * 60 + ' Minuten';
    }
    return hours + ' Stunden';
  }
}
