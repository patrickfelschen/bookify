import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

export class ProviderModel {
  public uid?: string;
  public name: string;
  public email: string;
  public phone: string;
  public serviceUids?: string[];

  constructor({ uid = '', name, email, phone, serviceUids = [] }) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.serviceUids = serviceUids;
  }
}

export const providerModelConverter = {
  toFirestore: (model: ProviderModel) => ({
    name: model.name,
    email: model.email,
    phone: model.phone,
    serviceUids: model.serviceUids,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new ProviderModel({
      uid: data.uid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      serviceUids: data.serviceUids,
    });
  },
};
