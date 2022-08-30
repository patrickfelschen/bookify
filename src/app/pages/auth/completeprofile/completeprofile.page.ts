import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonSlides, LoadingController } from '@ionic/angular';
import SwiperCore, {
  Autoplay,
  Keyboard,
  Pagination,
  Scrollbar,
  Zoom,
} from 'swiper';
import { IonicSlides } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { LocationService } from 'src/app/services/location.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { UserModel } from 'src/app/models/user.model';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-completeprofile',
  templateUrl: './completeprofile.page.html',
  styleUrls: ['./completeprofile.page.scss'],
})
export class CompleteprofilePage implements OnInit {
  @ViewChild('slides') slides: IonSlides;

  name: FormGroup;
  address: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private locationService: LocationService,
    private router: Router
  ) {}

  get firstname() {
    return this.name.get('firstname');
  }

  get lastname() {
    return this.name.get('lastname');
  }

  get addressline1() {
    return this.address.get('addressline1');
  }

  get addressline2() {
    return this.address.get('addressline2');
  }

  get postalcode() {
    return this.address.get('postalcode');
  }

  get city() {
    return this.address.get('city');
  }

  /**
   * Initialisierung der Validators für Namen und Adresse
   */
  ngOnInit() {
    this.name = this.fb.group({
      firstname: ['', [Validators.required, Validators.maxLength(30)]],
      lastname: ['', [Validators.required, Validators.maxLength(30)]],
    });

    this.address = this.fb.group({
      addressline1: ['', [Validators.required, Validators.maxLength(30)]],
      addressline2: ['', [Validators.maxLength(30)]],
      postalcode: ['', [Validators.required, Validators.maxLength(5)]],
      city: ['', [Validators.required, Validators.maxLength(30)]],
    });
  }

  /**
   * Benutzer von Firebase Auth abmelden
   */
  async signOut() {
    // Ladeanzeige anzeigen
    const loading = await this.loadingController.create();
    await this.authService.signOut();
    // Ladeanzeige verstecken
    await loading.dismiss();
    this.router.navigateByUrl('signin', { replaceUrl: true });
  }

  /**
   * Benutzer Orten und Automatisch die Adressfelder ausfüllen.
   */
  async fillLocation() {
    const loading = await this.loadingController.create();
    const result = await this.locationService.getCurrentAddress();

    this.addressline1.setValue(
      result.thoroughfare + ' ' + result.subThoroughfare
    );
    this.postalcode.setValue(result.postalCode);
    this.city.setValue(result.locality);

    await loading.dismiss();
  }

  /**
   * Profildaten in Firestore abspeichern und Benutzer zum Home Screen navigieren
   */
  async createProfile() {
    const loading = await this.loadingController.create();
    const userModel = new UserModel({
      firstname: this.firstname.value,
      lastname: this.lastname.value,
      addressline1: this.addressline1.value,
      addressline2: this.addressline2.value,
      postalcode: this.postalcode.value,
      city: this.city.value,
    });
    const result = await this.firestoreService.createUserProfile(userModel);
    await loading.dismiss();
    if (result === false) {
      this.showAlert('Firestore', 'Es ist ein Fehler aufgetreten!');
    }
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  /**
   * Zeigt eine Alert Nachricht
   *
   * @param header Überschrift
   * @param message Nachricht
   */
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Zum nächsten Schritt wischen
   */
  nextSlide() {
    this.slides.slideNext();
  }
}
