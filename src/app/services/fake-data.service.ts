import { Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  doc,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import {
  ProviderModel,
  providerModelConverter,
} from '../models/provider.model';
import { ServiceModel, serviceModelConverter } from '../models/service.mode';
import { faker } from '@faker-js/faker';
import { addDoc } from '@firebase/firestore';
import { SlotConfigModel, slotConfigModelConverter } from '../models/slotsconfig.model';

@Injectable({
  providedIn: 'root',
})
export class FakeDataService {
  private providersCollection: CollectionReference<ProviderModel>;
  private servicesCollection: CollectionReference<ServiceModel>;
  private serviceUids: string[] = [];
  private providers: ProviderModel[] = [];

  constructor(private firestore: Firestore) {
    this.providersCollection = collection(this.firestore,'providers').withConverter(providerModelConverter);
    this.servicesCollection = collection(this.firestore, 'services').withConverter(serviceModelConverter);
  }

  /**
   * Erstellt Fake Dienstleistungen zum Testen der Anwendung
   */
  async createServices() {
    const services: ServiceModel[] = [];
    services.push(new ServiceModel({ description: 'Hochzeits DJ (bis 50 Pers.)', duration: 8 }));
    services.push(new ServiceModel({ description: 'Hochzeits DJ (bis 100 Pers.)', duration: 8 }));
    services.push(new ServiceModel({ description: 'Hochzeits DJ (ab 100 Pers.)', duration: 8 }));
    services.push(new ServiceModel({ description: 'Hochzeits DJ Beratung', duration: 1 }));
    services.push(new ServiceModel({ description: 'Geburtstags DJ (bis 50 Pers.)', duration: 6 }));
    services.push(new ServiceModel({ description: 'Geburtstags DJ (bis 100 Pers.)', duration: 6 }));
    services.push(new ServiceModel({ description: 'Geburtstags DJ (ab 100 Pers.)', duration: 6 }));
    services.push(new ServiceModel({ description: 'Geburtstags DJ Beratung', duration: 0.25 }));
    services.push(new ServiceModel({ description: 'sonst. Feier DJ (bis 50 Pers.)', duration: 6 }));
    services.push(new ServiceModel({ description: 'sonst. Feier DJ (bis 100 Pers.)', duration: 6 }));
    services.push(new ServiceModel({ description: 'sonst. Feier DJ (ab 100 Pers.)', duration: 6 }));
    services.push(new ServiceModel({ description: 'Festival DJ', duration: 3 }));
    services.push(new ServiceModel({ description: 'Club DJ', duration: 5 }));

    for (const service of services) {
      const docRef = await addDoc(this.servicesCollection, service);
      this.serviceUids.push(docRef.id);
    }
  }

  /**
   * @param min Untere Grenze
   * @param max Obere Grenze
   * @returns Zufällige Ganzzahl zwischeh min und max
   */
  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Generiert eine Anzahl an Fake Dienstleister mit definierten Regeln.
   * Jeder Dienstleister erhält eine zufällige Anzahl an Dienstleistungen,
   * zwischen 4 und der maximalen Anzahl an vorhandenen Dienstleistungen.
   * Zudem werden zufällige Personendaten generiert.
   *
   * @param count Anzahl an Dienstleister
   */
  async generateProviders(count: number) {
    await this.createServices();

    for(let i = 0 ; i < count; i++){
      const serviceCount = this.getRandomInt(4, this.serviceUids.length);
      const providerServices = [];
      for(let j = 0; j < serviceCount; j++){
        let randIndex = this.getRandomInt(0, this.serviceUids.length);
        while(providerServices.includes(this.serviceUids[randIndex])){
          randIndex = this.getRandomInt(0, this.serviceUids.length);
        }
        providerServices.push(this.serviceUids[randIndex]);
      }
      const firstname = faker.name.firstName();
      const newProvider = new ProviderModel({
        name: `DJ ${firstname}`,
        email: faker.internet.email(firstname),
        phone: faker.phone.number('+49 #### #####'),
        serviceUids: providerServices,
        avatar: faker.image.avatar()
      });
      this.providers.push(newProvider);
    }

    for (const provider of this.providers) {
      await addDoc(this.providersCollection, provider);
      console.log(provider);
    }
  }

  /**
   * Erstellt Öffnungszeiten
   * MO-SA von 00:00 - 23:00,
   * SO von 00:00 - 05:00
   * und einer Slotgröße von einer Stunde.
   */
  async createSlotConfig() {
    const slotMillis = 60 * 60 * 1000; // 1h
    const openSlots: number[] = [];
    const sunSlots: number[] = [];
    for(let i = 0; i <= 23; i++){
      openSlots.push(i * slotMillis); // 0 - 23
    }
    for(let i = 0; i <= 5; i++){
      sunSlots.push(i * slotMillis); // 0 - 5
    }
    const slotConfig = new SlotConfigModel(
      slotMillis,
      openSlots,
      openSlots,
      openSlots,
      openSlots,
      openSlots,
      openSlots,
      sunSlots
    );
    const slotConfigRef = doc(this.firestore, 'configs/slotconfig').withConverter(slotConfigModelConverter);
    await setDoc(slotConfigRef, slotConfig);
    console.log(slotConfig);
  }
}
