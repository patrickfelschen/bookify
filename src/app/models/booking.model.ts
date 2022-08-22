import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';
import { DateRangeModel } from './daterange.model';
import { ProviderModel } from './provider.model';
import { ServiceModel } from './service.mode';

export class BookingModel {
  public date: DateRangeModel;
  public provider: ProviderModel;
  public service: ServiceModel;
  public uid: string;

  constructor(
    date: DateRangeModel,
    provider?: ProviderModel,
    service?: ServiceModel,
    uid?: string
  ) {
    this.date = date;
    this.provider = provider;
    this.service = service;
    this.uid = uid;
  }
}

export const bookingModelConverter = {
  toFirestore: (model: BookingModel) => ({
    date: model.date,
    provider: model.provider,
    service: model.service,
    uid: model.uid,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new BookingModel(data.date, data.provider, data.service, data.uid);
  },
};
