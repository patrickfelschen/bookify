import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  servicesCollection: CollectionReference;
  providersCollection: CollectionReference;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.servicesCollection = collection(this.firestore, 'services');
    this.providersCollection = collection(this.firestore, 'providers');
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

  async createUserProfile(user) {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.firestore, `users/${authUser.uid}`);
    try {
      await setDoc(userDocRef, user);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  getUserProfile() {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.firestore, `users/${authUser.uid}`);
    return docData(userDocRef, { idField: 'uid' });
  }

  async getBookingConfig() {
    const configDocRef = doc(this.firestore, `configs/booking`);
    try {
      const docSnap = await getDoc(configDocRef);
      return docSnap.data();
    } catch (error) {
      return null;
    }
  }

  getAllServices() {
    return collectionData(this.servicesCollection, { idField: 'uid' });
  }

  getProvidersByService(service) {
    const providerQuery = query(
      this.providersCollection,
      where('serviceUids', 'array-contains', service.uid),
      orderBy('name', 'asc')
    );
    return collectionData(providerQuery, { idField: 'uid' });
  }

  async getBookingsByProvider(provider, date) {
    const bookingsCollection = collection(this.firestore, `providers/${provider.uid}/bookings`);
    const bookingsQuery = query(
      bookingsCollection,
      //where('provider.uid', '==', provider.uid),
      where('date.start', '>=', date),
      //orderBy('date.start', 'asc')
    );
    const querySnap = await getDocs(bookingsQuery); // ?????
    return querySnap.docs;
  }

  async createBooking(booking) {
    const authUser = this.getCurrentAuthUser();
    const userBookingsCollection = collection(
      this.firestore,
      `users/${authUser.uid}/bookings`
    );
    const providerBookingsCollection = collection(
      this.firestore,
      `providers/${booking.provider.uid}/bookings`
    );
    try {
      await addDoc(userBookingsCollection, booking);
      await addDoc(providerBookingsCollection, booking.date);
      return true;
    } catch (error) {
      return false;
    }
  }
}
