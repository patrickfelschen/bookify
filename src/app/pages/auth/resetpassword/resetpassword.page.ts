import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.page.html',
  styleUrls: ['./resetpassword.page.scss'],
})
export class ResetpasswordPage implements OnInit {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router
  ) {}

  get email() {
    return this.credentials.get('email');
  }

  /**
   * Initialisierung der Validators für die E-Mail
   */
  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * E-Mail an Benutzer senden, um ein neues Passwort zu setzen.
   * Der Benutzer erhält eine Rückmeldung, ob der Vorgang erfolgreich war.
   */
  async resetPassword() {
    // Ladeanzeige anzeigen
    const loading = await this.loadingController.create();
    await loading.present();
    // Benutzer anmelden
    const status = await this.authService.resetPassword(this.credentials.value);
    // Ladeanzeige verstecken
    await loading.dismiss();
    // Status prüfen
    if (status === true) {
      this.navigateToSignIn();
    } else {
      this.showAlert('Zurücksetzen fehlgeschlagen', 'Versuche es erneut!');
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

  /**
   * Navigiert zum Anmelde Screen
   */
  navigateToSignIn() {
    this.router.navigateByUrl('signin', { replaceUrl: true });
  }
}
