import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router
  ) { }

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async signUp(){
    // Ladeanzeige anzeigen
    const loading = await this.loadingController.create();
    await loading.present();
    // Benutzer registrieren
    const user = await this.authService.signUp(this.credentials.value);
    // Ladeanzeige verstecken
    await loading.dismiss();
    // Status prüfen
    if(user != null){
      this.router.navigateByUrl('/home', {replaceUrl: true});
    } else {
      this.showAlert('Registrierung fehlgeschlagen', 'Versuche es erneut!');
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

    async navigateToSignIn() {
      this.router.navigateByUrl('signin', { replaceUrl: true });
    }
}
