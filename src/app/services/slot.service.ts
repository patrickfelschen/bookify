import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { format, isSameDay } from 'date-fns';
import { SlotModel } from '../models/slot.model';
import { SlotConfigModel } from '../models/slotsconfig.model';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  availableSlots = new Map();
  config: SlotConfigModel;

  constructor() {}

  /**
   * Liefert die Verfügbaren Termine des gewählten Tages, bzw. gewählter Tag + dayCount, zurück
   *
   * @param date In Kalender gewähltes Datum
   * @param bookedSlots Vorhandene Buchungen des Providers (belegte Slots)
   * @param dayCount Anzahl nächsten Tage, die mit einbezogen werden sollen
   * @param duration Anzahl an Slots, die eine Dienstleistung einnimmt
   * @param slotConfig Konfiguration
   * @returns Array der Verfügbaren Termine
   */
  getAvailableSlots(
    date: Date,
    bookedSlots: SlotModel[],
    dayCount: number,
    duration: number,
    slotConfig: SlotConfigModel
  ) {
    // Alle möglichen Slots des Tages (falls dayCount > 0 auch Slots der nächsten Tage)
    date.setHours(0, 0, 0, 0);
    this.config = slotConfig;
    this.availableSlots = this.getDayTimeSlots(date, dayCount);
    const blockedSlots = [];

    // Falls Bookings vorhanden
    if (bookedSlots.length) {
      // Belegte Slots
      for (const slot of bookedSlots) {
        const dayInSeconds = slot.dayMillis;
        for (const bookingSlot of slot.slotsMillis) {
          blockedSlots.push(dayInSeconds + bookingSlot);
        }
      }

      // Belegte Slots von verfügbaren abziehen
      for (const key of this.availableSlots.keys()) {
        // console.log('Slot: ' + new Date(slotKey));
        for (const blockedTimestamp of blockedSlots) {
          // console.log('Blocked: ' + new Date(blockedTimestamp));
          if (key === blockedTimestamp) {
            this.availableSlots.get(key).blocked = true;
            break;
          }
        }
        // console.log('------------------');
      }
    }
    // Prüfung ob die Zeitspanne von duration in den Slots verfügbar ist
    this.filterDuration(date, slotConfig.slotMillis, duration);

    return this.availableSlots;
  }

  /**
   * Entfernt die Terminslots aus den verfügbaren Slots, die nicht genügen Zeit für die gewählte Dienstleistung bieten
   *
   * @param date In Kalender gewähltes Datum
   * @param singleSlotMillis Länge eines Zeitslots in Millisekunden
   * @param duration Anzahl an Slots, die eine Dienstleistung einnimmt
   */
  filterDuration(date: Date, singleSlotMillis: number, duration: number) {
    // Anzahl an Slots, die direkt aufeinander folgen
    let consecutiveSlots = 0;
    // Gesamtzeit der Dienstleistung in Millisekunden
    const slotMillis = singleSlotMillis * duration;

    // Alle übrigen Slots
    for (const key of this.availableSlots.keys()) {
      // Bereits blockierte Slots werden übersprungen
      if (this.availableSlots.get(key).blocked === true) {
        // Slots, die nicht am akutellen Tag liegen und blockiert sind, sind nicht für die Anzeige verfügbarer Slots
        // notwendig und können gelöscht werden
        if (!isSameDay(key, date)) {
          //console.log('delete: ' + new Date(key));
          this.availableSlots.delete(key);
        }
        continue;
      }
      //console.log('Current: ' + new Date(key).toLocaleTimeString());
      // Schleife von aktuellem Slot bis Slot + Länge der Dienstleistung
      for (let j = key; j < key + slotMillis; j += singleSlotMillis) {
        //console.log('Next: ' + new Date(j + this.config.slotMillis).toLocaleTimeString());
        // Wenn aktueller Timestamp + die Länge eines Zeitslots = dem nächsten Timestamp sind, gibt es zwischen diesen keine Unterbrechung
        const element = this.availableSlots.get(j);
        if (element !== undefined && element.blocked === false) {
          consecutiveSlots++;
        } else {
          break;
        }
      }

      // Prüfen, ob genug zusammenhängende Slots für die gewählte Dienstleistung gefunden wurden
      if (!(consecutiveSlots >= duration)) {
        this.availableSlots.get(key).blocked = true;
      }
      if (!isSameDay(key, date)) {
        // console.log('delete: ' + new Date(key));
        this.availableSlots.delete(key);
      }
      //console.log('Consecutive slots: ' + consecutiveSlots);
      //console.log('---------------------------');
      consecutiveSlots = 0;
    }
  }

  /**
   * Liest aus der Konfiguration die verfügbaren Slots für den gewählten Wochentag
   *
   * @param weekDay Gewählter Tag der Woche (1- 7)
   * @returns Verfügbare Slots des Wochentages
   */
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

  /**
   * Liefert Map aller möglichen Slots (Key = timestamp des Slots)
   *
   * @param date Gewähltes Datum
   * @param dayCount Anzahl an weiteren Tagen, die mit einbezogen werden sollen
   * @returns Alle möglichen Slots der gewählten Tage
   */
  getDayTimeSlots(date: Date, dayCount: number) {
    // Gewählter Wochentag (1 - 7)
    const weekday = parseInt(format(date, 'e'), 10);
    const timestamp = Timestamp.fromDate(date);
    const dayInMs = 86400000; // Millisekunden eines Tages
    const slots = new Map();
    let tmp = [];

    for (let i = 0; i <= dayCount; i++) {
      // Index für die Slots der nächsten Tage. Modulo Rechnung um Werte von 1 - 7 zu erhalten
      const index = ((weekday + i - 1) % 7) + 1;
      tmp = this.getSlotsOfWeekDay(index.toString());

      for (const slot of tmp) {
        const key = (timestamp.toMillis() + slot) + (i * dayInMs);
        slots.set(key, {
          blocked: false, // Slots blockiert?
          timeString: new Date(key).toLocaleTimeString(), // Zeit in lesbarem Format
          dayMillis: Timestamp.fromDate(date).toMillis() // Tag des Slots in Millisekunden (0 Uhr)
        });
      }
    }

    return slots;
  }
}
