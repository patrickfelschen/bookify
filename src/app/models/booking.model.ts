import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';
import { DateModel } from './date.model';
import { ProviderModel } from './provider.model';
import { ServiceModel } from './service.mode';

/**
 * Klasse für Buchungen von Benutzer
 */
export class BookingModel {
  public uid?: string;
  public date: DateModel;
  public provider: ProviderModel;
  public service: ServiceModel;

  constructor({ uid = '', date, provider, service }) {
    this.uid = uid;
    this.date = date;
    this.provider = provider;
    this.service = service;
  }
}

export const bookingModelConverter = {
  toFirestore: (m: BookingModel) => ({
    date: {
      start: m.date.start,
      end: m.date.end,
    },
    provider: {
      uid: m.provider.uid,
      name: m.provider.name,
      email: m.provider.email,
      phone: m.provider.phone,
      avatar: m.provider.avatar,
    },
    service: {
      uid: m.service.uid,
      description: m.service.description,
    },
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const d = snapshot.data(options);
    return new BookingModel({
      uid: d.uid,
      date: new DateModel({ start: d.date.start, end: d.date.end }),
      provider: d.provider,
      service: d.service,
    });
  },
};
