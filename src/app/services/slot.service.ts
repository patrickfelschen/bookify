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
      // let slotBlocked = false;
      for (const key of this.availableSlots.keys()) {
        // console.log('Slot: ' + new Date(slotKey));
        for (const blockedTimestamp of blockedSlots) {
          // console.log('Blocked: ' + new Date(blockedTimestamp));
          if (key === blockedTimestamp) {
            this.availableSlots.get(key).blocked = true;
            break;
          }
        }
        // slotBlocked = false;
        // console.log('------------------');
      }
    }
    this.filterDuration(date, slotConfig.slotSeconds, duration);
    // console.log(this.availableSlots);
    // this.convertTimestampsToHours(dateTime);
    return this.availableSlots;
  }

  filterDuration(date: Date, singleSlotMillis: number, duration: number) {
    let consecutiveSlots = 0;
    const slotMillis = singleSlotMillis * duration;

    // Alle übrigen Slots
    for (const key of this.availableSlots.keys()) {
      if (this.availableSlots.get(key).blocked === true) {
        if (!isSameDay(key, date)) {
          // console.log('delete: ' + new Date(key));
          this.availableSlots.delete(key);
        }
        continue;
      }
      // console.log('Current: ' + new Date(key).toLocaleTimeString());
      // Schleife von aktuellem Slot bis Slot + Länge der Dienstleistung
      for (let j = key; j < key + slotMillis; j += singleSlotMillis) {
        // console.log('Next: ' + new Date(j + this.config.slotSeconds).toLocaleTimeString());
        // Wenn aktueller Timestamp + die Länge eines Zeitslots = dem nächsten Timestamp sind, gibt es zwischen diesen keine Unterbrechung
        const element = this.availableSlots.get(j + singleSlotMillis);
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
      // console.log('Consecutive slots: ' + consecutiveSlots);
      // console.log('---------------------------');
      consecutiveSlots = 0;
    }
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
          blocked: false,
          timeString: new Date(key).toLocaleTimeString(),
          dayMillis: Timestamp.fromDate(date).toMillis()
        });
      }
    }

    return slots;
  }
}
