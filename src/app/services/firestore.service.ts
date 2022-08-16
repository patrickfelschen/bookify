import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  getCurrentAuthUser() {
    const user = this.auth.currentUser;
    return user;
  }

  async userDocExists() {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.firestore, `users/${authUser.uid}`);
    try {
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists();
    } catch (error) {
      return false;
    }
  }

  async createUser({
    firstname,
    lastname,
    addressline1,
    addressline2,
    postalcode,
    city,
  }) {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.firestore, `users/${authUser.uid}`);
    try {
      await setDoc(userDocRef, {
        firstname,
        lastname,
        addressline1,
        addressline2,
        postalcode,
        city,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
