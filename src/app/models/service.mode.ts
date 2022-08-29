import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

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
    uid: model.uid,
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