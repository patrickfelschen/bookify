export class UserModel {
  uid: string;
  firstname: string;
  lastname: string;
  addressline1: string;
  addressline2: string;
  postalcode: string;
  city: string;

  constructor(
    uid,
    firstname,
    lastname,
    addressline1,
    addressline2,
    postalcode,
    city
  ) {
    this.uid = uid;
    this.firstname = firstname;
    this.lastname = lastname;
    this.addressline1 = addressline1;
    this.addressline2 = addressline2;
    this.postalcode = postalcode;
    this.city = city;
  }

  toString() {
    return JSON.stringify(this);
  }

  // Firestore data converter
  // const userModelConverter = {
  //   toFirestore: (userModel) => {
  //     return {
  //       firstname: userModel.firstname,
  //       lastname: userModel.lastname,
  //       addressline1: userModel.addressline1,
  //       addressline2: userModel.addressline2,
  //       postalcode: userModel.postalcode,
  //       city: userModel.city,
  //     };
  //   },
  //   fromFirestore: (snapshot, options) => {
  //     const data = snapshot.data(options);
  //     return new UserModel(
  //       data.firstname,
  //       data.lastname,
  //       data.addressline1,
  //       data.addressline2,
  //       data.postalcode,
  //       data.city
  //     );
  //   },
  // };
}
