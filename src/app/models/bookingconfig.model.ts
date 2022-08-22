import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

export class BookingConfigModel {
  constructor(
    public slotsize: number,
    public mon: string[],
    public tue: string[],
    public wed: string[],
    public thu: string[],
    public fri: string[],
    public sat: string[],
    public sun: string[]
  ) {}
}

export const bookingConfigModelConverter = {
  toFirestore: (model: BookingConfigModel) => ({
    slotsize: model.slotsize,
    mon: model.mon,
    tue: model.tue,
    wed: model.wed,
    thu: model.thu,
    fri: model.fri,
    sat: model.sat,
    sun: model.sun,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new BookingConfigModel(
      data.slotsize,
      data.mon,
      data.tue,
      data.wed,
      data.thu,
      data.fri,
      data.sat,
      data.sun
    );
  },
};
