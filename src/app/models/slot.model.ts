import { DocumentSnapshot, SnapshotOptions, Timestamp } from '@angular/fire/firestore';

export class SlotModel {
  constructor(
    public daySeconds: number,
    public slotSeconds: number[],
    public uid: string,
  ){}

  getStartTimestamp(): Timestamp{
    let firstSlot = this.slotSeconds[0];
    if (firstSlot === undefined){
      firstSlot = 0;
    }
    return Timestamp.fromMillis((this.daySeconds + firstSlot) * 1000);
  }

  getEndTimestamp(): Timestamp {
    let lastSlot = this.slotSeconds[this.slotSeconds.length - 1];
    if (lastSlot === undefined){
      lastSlot = 0;
    }
    return Timestamp.fromMillis((this.daySeconds + lastSlot) * 1000);
  }
}

export const slotModelConverter = {
  toFirestore: (model: SlotModel) => ({
    daySeconds: model.daySeconds,
    slotSeconds: model.slotSeconds,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new SlotModel(
      data.daySeconds,
      data.slotSeconds,
      data.uid
    );
  },
};
