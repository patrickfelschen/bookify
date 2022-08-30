import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

/**
 * Klasse für Benutzerdaten, diese werden beim Anmelden erfasst.
 */
export class UserModel {
  public uid?: string;
  public firstname: string;
  public lastname: string;
  public addressline1: string;
  public addressline2: string;
  public postalcode: string;
  public city: string;

  constructor({
    uid = '',
    firstname,
    lastname,
    addressline1,
    addressline2,
    postalcode,
    city,
  }) {
    this.uid = uid;
    this.firstname = firstname;
    this.lastname = lastname;
    this.addressline1 = addressline1;
    this.addressline2 = addressline2;
    this.postalcode = postalcode;
    this.city = city;
  }
}

export const userModelConverter = {
  toFirestore: (model: UserModel) => ({
    firstname: model.firstname,
    lastname: model.lastname,
    addressline1: model.addressline1,
    addressline2: model.addressline2,
    postalcode: model.postalcode,
    city: model.city,
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new UserModel({
      uid: data.uid,
      firstname: data.firstname,
      lastname: data.lastname,
      addressline1: data.addressline1,
      addressline2: data.addressline2,
      postalcode: data.postalcode,
      city: data.city,
    });
  },
};
