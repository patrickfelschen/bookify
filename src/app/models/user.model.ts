import { DocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';

export class UserModel {
  public firstname: string;
  public lastname: string;
  public addressline1: string;
  public addressline2: string;
  public postalcode: string;
  public city: string;
  public uid: string;

  constructor(
    firstname = '',
    lastname = '',
    addressline1 = '',
    addressline2 = '',
    postalcode = '',
    city = '',
    uid = '',
  ) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.addressline1 = addressline1;
    this.addressline2 = addressline2;
    this.postalcode = postalcode;
    this.city = city;
    this.uid = uid;
  }
}

export const userModelConverter = {
  toFirestore: (model: UserModel) => ({
    firstname: model.firstname,
    lastname: model.lastname,
    addressline1: model.addressline1,
    addressline2: model.addressline2,
    postalcode: model.postalcode,
    city: model.city
  }),
  fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return new UserModel(
      data.firstname,
      data.lastname,
      data.addressline1,
      data.addressline2,
      data.postalcode,
      data.city,
      data.uid
    );
  },
};
