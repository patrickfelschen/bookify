import { DocumentSnapshot, SnapshotOptions, Timestamp } from '@angular/fire/firestore';

export class SlotModel {
  constructor(
    public dayMillis: number,
    public slotsMillis: number[],
    public uid: string,
  ){}

  getStartTimestamp(): Timestamp{
    let firstSlot = this.dayMillis[0];
    if (firstSlot === undefined){
      firstSlot = 0;
    }
    return Timestamp.fromMillis((this.slotsMillis + firstSlot) * 1000);
  }

  getEndTimestamp(): Timestamp {
    let lastSlot = this.slotsMillis[this.slotsMillis.length - 1];
    if (lastSlot === undefined){
      lastSlot = 0;
    }
    return Timestamp.fromMillis((this.dayMillis + lastSlot) * 1000);
  }
}

export const slotModelConverter = {
  toFirestore: (model: SlotModel) => ({
    daySeconds: model.dayMillis,
    slotSeconds: model.slotsMillis,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new SlotModel(
      data.dayMillis,
      data.slotsMillis,
      data.uid
    );
  },
};
