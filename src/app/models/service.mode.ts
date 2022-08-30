import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

/**
 * Klasse für Dienstleistungen
 * Über die Dauer (Duration) lässt sich Länge einer Dienstleistung berechnen.
 */
export class ServiceModel {
  public uid?: string;
  public description: string;
  public duration?: number;

  constructor({ uid = '', description, duration = 1 }) {
    this.uid = uid;
    this.description = description;
    this.duration = duration;
  }
}

export const serviceModelConverter = {
  toFirestore: (model: ServiceModel) => ({
    description: model.description,
    duration: model.duration,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new ServiceModel({
      uid: data.uid,
      description: data.description,
      duration: data.duration,
    });
  },
};
