import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private router: Router
  ) {}

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.maxLength(30), Validators.email],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(40),
        ],
      ],
    });
  }

  async signIn() {
    // Ladeanzeige anzeigen
    const loading = await this.loadingController.create();
    await loading.present();
    // Benutzer anmelden
    const user = await this.authService.signIn(this.credentials.value);
    // Ladeanzeige verstecken
    await loading.dismiss();
    // Status prüfen
    if (user != null) {
      // Prüfen ob ein User Profil bereits existiert
      const userExists = await this.firestoreService.userProfileExists();
      if (userExists === true) {
        // Profil existiert
        this.router.navigateByUrl('home', { replaceUrl: true });
      } else {
        // Profil muss erstellt werden
        this.router.navigateByUrl('completeprofile', { replaceUrl: true });
      }
    } else {
      this.showAlert('Anmeldung fehlgeschlagen', 'Versuche es erneut!');
    }
  }

  /**
   * Zeigt eine Alert Nachricht
   *
   * @param header Überschrift Zeichenkette
   * @param message Nachricht Zeichenkette
   */
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async navigateToResetPassword() {
    this.router.navigateByUrl('resetpassword', { replaceUrl: true });
  }

  async navigateToSignUp() {
    this.router.navigateByUrl('signup', { replaceUrl: true });
  }
}
