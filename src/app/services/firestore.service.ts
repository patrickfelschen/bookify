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
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BookingModel, bookingModelConverter } from '../models/booking.model';
import { BookingConfigModel, bookingConfigModelConverter } from '../models/bookingconfig.model';
import { DateRangeModel } from '../models/daterange.model';
import { ProviderModel, providerModelConverter } from '../models/provider.model';
import { ServiceModel, serviceModelConverter } from '../models/service.mode';
import { UserModel, userModelConverter } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private usersCollection: CollectionReference<UserModel>;
  private servicesCollection: CollectionReference<ServiceModel>;
  private providersCollection: CollectionReference<ProviderModel>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users').withConverter(userModelConverter);
    this.servicesCollection = collection(this.firestore, 'services').withConverter(serviceModelConverter);
    this.providersCollection = collection(this.firestore, 'providers').withConverter(providerModelConverter);
  }

  getCurrentAuthUser() {
    return this.auth.currentUser;
  }

  async userProfileExists() {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.usersCollection, authUser.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists();
    } catch (error) {
      return false;
    }
  }

  async createUserProfile(user: UserModel) {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.usersCollection, authUser.uid);
    try {
      await setDoc(userDocRef, user);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  streamUserProfile(): Observable<UserModel> {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.usersCollection, authUser.uid);
    return docData(userDocRef, { idField: 'uid' });
  }

  async getBookingConfig(): Promise<BookingConfigModel> {
    const configDocRef = doc(this.firestore, `configs/slotconfig`).withConverter(bookingConfigModelConverter);
    try {
      const docSnap = await getDoc(configDocRef);
      return docSnap.data();
    } catch (error) {
      return null;
    }
  }

  streamAllServices(): Observable<ServiceModel[]> {
    return collectionData(this.servicesCollection, { idField: 'uid' });
  }

  streamProvidersByService(service: ServiceModel): Observable<ProviderModel[]> {
    const providerQuery = query(
      this.providersCollection,
      where('serviceUids', 'array-contains', service.uid),
      orderBy('name', 'asc')
    );
    return collectionData(providerQuery, { idField: 'uid' });
  }

  streamBookingsByProvider(provider: ProviderModel, startDay: Date, days?: number): Observable<BookingModel[]> {
    startDay.setHours(0, 0, 0, 0);
    const timestamp = Timestamp.fromDate(startDay);

    const bookingsCollection = collection(
      this.firestore,
      `providers/${provider.uid}/bookings`
    ).withConverter(bookingModelConverter);
    const bookingsQuery = query(
      bookingsCollection,
      where('date.day', '>=', timestamp.toMillis()),
      where('date.day', '<=', timestamp.toMillis() + (days * 60 * 60 * 24 * 1000))
    );
    return collectionData(bookingsQuery, { idField: 'uid' });
  }

  async createBooking(booking: BookingModel) {
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
