import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

export class ServiceModel {
  public description: string;
  public duration: number;
  public uid: string;

  constructor(description = '', duration = 1, uid = '') {
    this.description = description;
    this.duration = duration;
    this.uid = uid;
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
    return new ServiceModel(data.description, data.duration, data.uid);
  },
};
