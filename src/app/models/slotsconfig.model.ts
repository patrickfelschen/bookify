import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

export class SlotConfigModel {
  constructor(
    public slotMillis: number,
    public mon: number[],
    public tue: number[],
    public wed: number[],
    public thu: number[],
    public fri: number[],
    public sat: number[],
    public sun: number[]
  ) {}
}

export const slotConfigModelConverter = {
  toFirestore: (model: SlotConfigModel) => ({
    slotMillis: model.slotMillis,
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
    return new SlotConfigModel(
      data.slotMillis,
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
