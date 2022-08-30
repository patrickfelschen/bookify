import {
  DocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from '@angular/fire/firestore';

/**
 * Klasse für Zeitfenster, welche bei
 * einem Dienstleister gebucht werden können.
 */
export class SlotModel {
  public uid?: string;
  public bookingUid: string;
  public dayMillis: number;
  public slotsMillis: number[];

  constructor({ uid = '', bookingUid = '', dayMillis, slotsMillis }) {
    this.uid = uid;
    this.bookingUid = bookingUid;
    this.dayMillis = dayMillis;
    this.slotsMillis = slotsMillis;
  }

  getStartTimestamp(): Timestamp {
    let firstSlot = this.dayMillis[0];
    if (firstSlot === undefined) {
      firstSlot = 0;
    }
    return Timestamp.fromMillis((this.slotsMillis + firstSlot) * 1000);
  }

  getEndTimestamp(): Timestamp {
    let lastSlot = this.slotsMillis[this.slotsMillis.length - 1];
    if (lastSlot === undefined) {
      lastSlot = 0;
    }
    return Timestamp.fromMillis((this.dayMillis + lastSlot) * 1000);
  }
}

export const slotModelConverter = {
  toFirestore: (m: SlotModel) => ({
    bookingUid: m.bookingUid,
    dayMillis: m.dayMillis,
    slotsMillis: m.slotsMillis,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const d = snapshot.data(options);
    return new SlotModel({
      uid: d.uid,
      bookingUid: d.bookingUid,
      dayMillis: d.dayMillis,
      slotsMillis: d.slotsMillis,
    });
  },
};
