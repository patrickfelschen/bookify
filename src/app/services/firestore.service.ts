import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  DocumentReference,
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
import { ProviderModel, providerModelConverter } from '../models/provider.model';
import { ServiceModel, serviceModelConverter } from '../models/service.mode';
import { SlotModel, slotModelConverter } from '../models/slot.model';
import { SlotConfigModel, slotConfigModelConverter } from '../models/slotsconfig.model';
import { UserModel, userModelConverter } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private usersCollection: CollectionReference<UserModel>;
  private servicesCollection: CollectionReference<ServiceModel>;
  private providersCollection: CollectionReference<ProviderModel>;

  /**
   * Initialisieren der Collections mit den dazugehörigen Convertern
   */
  constructor(private auth: Auth, private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users').withConverter(userModelConverter);
    this.servicesCollection = collection(this.firestore, 'services').withConverter(serviceModelConverter);
    this.providersCollection = collection(this.firestore, 'providers').withConverter(providerModelConverter);
  }

  /**
   * Benutzer aus Firebase Auth auslesen
   *
   * @returns aktueller Benutzer
   */
  getCurrentAuthUser() {
    return this.auth.currentUser;
  }

  /**
   * Prüfen ob Benutzer Profil existiert
   *
   * @returns true wenn Profil existiert, ansonsten false
   */
  async userProfileExists() {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.usersCollection, authUser.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists();
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Benutzer Profil in Firestore anlegen
   *
   * @param user Benutzer Profil Daten
   * @returns true wenn Vorgang erfolgreich, ansonsten false
   */
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

  /**
   * Liefert einen Stream des aktuellen Benutzer Profils zurück
   *
   * @returns Stream des Profils
   */
  streamUserProfile(): Observable<UserModel> {
    const authUser = this.getCurrentAuthUser();
    const userDocRef = doc(this.usersCollection, authUser.uid);
    return docData(userDocRef, { idField: 'uid' });
  }

  /**
   * Liefert einmalig die Zeitfenster Einstellungen zurück
   *
   * @returns Einstellungen
   */
  async getSlotConfig(): Promise<SlotConfigModel> {
    const configDocRef = doc(this.firestore, `configs/slotconfig`).withConverter(slotConfigModelConverter);
    try {
      const docSnap = await getDoc(configDocRef);
      return docSnap.data();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Liefert einen Stream aller Dienstleistungen zurück
   *
   * @returns Stream aller Dienstleistungen
   */
  streamAllServices(): Observable<ServiceModel[]> {
    const serviceQuery = query(
      this.servicesCollection,
      orderBy('description', 'asc')
    );
    return collectionData(serviceQuery, { idField: 'uid' });
  }

  /**
   * Liefert einen Stream von Dienstleistern gefiltert nach Dienstleistungen zurück
   *
   * @param service Dienstleistung, nach der gefiltert werden soll
   * @returns Stream der zuständigen Dienstleister
   */
  streamProvidersByService(service: ServiceModel): Observable<ProviderModel[]> {
    const providerQuery = query(
      this.providersCollection,
      where('serviceUids', 'array-contains', service.uid),
      orderBy('name', 'asc')
    );
    return collectionData(providerQuery, { idField: 'uid' });
  }

  /**
   * Liefert einen Stream von belegten Zeitfenstern eines Dienstleisters zurück
   *
   * @param provider gewählter Dienstleister
   * @param startDay Angabe von welchem Tag die Zeitfenster kommen sollen
   * @param days Anzahl zusätzlicher Tage nach "startDate"
   * @returns belegte Zeitfenster
   */
  streamSlotsByProvider(provider: ProviderModel, startDay: Date, days?: number): Observable<SlotModel[]> {
    startDay.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(startDay);
    // console.log(startTimestamp.toMillis());
    const slotsCollection = collection(
      this.firestore,
      `providers/${provider.uid}/slots`
    ).withConverter(slotModelConverter);
    const bookingsQuery = query(
      slotsCollection,
      where('dayMillis', '>=', startTimestamp.toMillis()),
      where('dayMillis', '<=', startTimestamp.toMillis() + (days * 60 * 60 * 24 * 1000))
    );
    return collectionData(bookingsQuery, { idField: 'uid' });
  }

  /**
   * Erstellt eine Buchung in der User Booking Collection und
   * Einträge der belegten Zeitfenster im Provider.
   *
   * @param booking Buchungsinformationen
   * @param slots belegte Slots (pro Tag)
   * @returns true wenn Vorgang erfolgreich, ansonsten false
   */
  async createBooking(booking: BookingModel, slots: SlotModel[]) {
    const authUser = this.getCurrentAuthUser();
    const userBookingsCollection = collection(
      this.firestore,
      `users/${authUser.uid}/bookings`
    ).withConverter(bookingModelConverter);
    const providerBookingsCollection = collection(
      this.firestore,
      `providers/${booking.provider.uid}/slots`
    ).withConverter(slotModelConverter);
    try {
      const bookingDoc: DocumentReference = await addDoc(userBookingsCollection, booking);
      for(const slot of slots){
        slot.bookingUid = bookingDoc.id;
        await addDoc(providerBookingsCollection, slot);
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Entfernt eine Buchung aus der User Booking Collection.
   * Zudem werden die belegten Zeitfenster des Providers wieder frei gegeben (gelöscht).
   *
   * @param booking zu löschende Buchung
   */
  async deleteUserBooking(booking: BookingModel) {
    const authUser = this.getCurrentAuthUser();
    const userBookingDocRef = doc(this.firestore, `users/${authUser.uid}/bookings/${booking.uid}`);
    try {
      const docSnap = await deleteDoc(userBookingDocRef);
    } catch(error) {
      console.log(error);
    }
    const providerSlotsCollection = collection(
      this.firestore,
      `providers/${booking.provider.uid}/slots`
    );
    const bookingQuery = query(
      providerSlotsCollection,
      where('bookingUid', '==', booking.uid)
    );
    collectionData(bookingQuery, { idField: 'uid' }).subscribe(docs => {
      docs.forEach(async slotDoc => {
        const slotDocRef = doc(this.firestore, `providers/${booking.provider.uid}/slots/${slotDoc.uid}`);
        await deleteDoc(slotDocRef);
      });
    });
  }

  /**
   * Liefert einen Stream der vergangenen Buchungen eines Benutzers zurück
   *
   * @returns vergangene Buchungen
   */
  streamPastBooking(): Observable<BookingModel[]> {
    const authUser = this.getCurrentAuthUser();
    const userBookingsCollection = collection(
      this.firestore,
      `users/${authUser.uid}/bookings`
    ).withConverter(bookingModelConverter);
    const bookingQuery = query(
      userBookingsCollection,
      where('date.end', '<', Timestamp.now().toMillis())
    );
    return collectionData(bookingQuery, {idField: 'uid'});
  }

  /**
   * Liefert einen Stream der kommenden Buchungen eines Benutzers zurück
   *
   * @returns kommende Buchungen
   */
  streamFutureBooking(): Observable<BookingModel[]> {
    const authUser = this.getCurrentAuthUser();
    const userBookingsCollection = collection(
      this.firestore,
      `users/${authUser.uid}/bookings`
    ).withConverter(bookingModelConverter);
    const bookingQuery = query(
      userBookingsCollection,
      where('date.end', '>=', Timestamp.now().toMillis())
    );
    return collectionData(bookingQuery, {idField: 'uid'});
  }
}
