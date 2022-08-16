import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  Firestore,
  getDoc,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  servicesCollection: CollectionReference;
  providersCollection: CollectionReference;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.servicesCollection = collection(this.firestore, 'services');
    this.providersCollection = collection(this.firestore, 'provides');
  }

  getCurrentAuthUser() {
    const user = this.auth.currentUser;
    return user;
  }

  async userProfileExists() {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.firestore, `users/${authUser.uid}`);
    try {
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists();
    } catch (error) {
      return false;
    }
  }

  async createUserProfile({
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

  getUserProfile() {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.firestore, `users/${authUser.uid}`);
    return docData(userDocRef);
  }

  getAllServices() {
    return collectionData(this.servicesCollection, {idField: 'uid'});
  }

  getProvidersByService(service){
    const q = query(this.providersCollection, where('serviceUids', 'array-contains', service.uid));
    return q;
  }

}
