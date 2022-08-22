import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

export class ProviderModel {
  public name: string;
  public email: string;
  public phone: string;
  public serviceUids: string[];
  public uid: string;

  constructor(name = '', email = '', phone = '', serviceUids = [], uid = '') {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.serviceUids = serviceUids;
    this.uid = uid;
  }
}

export const providerModelConverter = {
  toFirestore: (model: ProviderModel) => ({
    name: model.name,
    email: model.email,
    phone: model.phone,
    serviceUids: model.serviceUids
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new ProviderModel(
      data.name,
      data.email,
      data.phone,
      data.serviceUids,
      data.uid
    );
  },
};
