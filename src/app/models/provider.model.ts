import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

/**
 * Klasse für Dienstleister
 * Dienstleister halten IDs von Dienstleistungen,
 * um zugeordnet werden zu können.
 */
export class ProviderModel {
  public uid?: string;
  public name: string;
  public email: string;
  public phone: string;
  public avatar: string;
  public serviceUids?: string[];

  constructor({ uid = '', name, email, phone, avatar, serviceUids = [] }) {
    this.uid = uid;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.avatar = avatar;
    this.serviceUids = serviceUids;
  }
}

export const providerModelConverter = {
  toFirestore: (model: ProviderModel) => ({
    name: model.name,
    email: model.email,
    phone: model.phone,
    avatar: model.avatar,
    serviceUids: model.serviceUids,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new ProviderModel({
      uid: data.uid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      serviceUids: data.serviceUids,
    });
  },
};
