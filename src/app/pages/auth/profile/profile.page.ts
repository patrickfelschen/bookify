import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FirestoreService } from '../../../services/firestore.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UserModel } from 'src/app/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  mail: string;
  user: UserModel;
  userObservable: Subscription = Subscription.EMPTY;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private firestoreService: FirestoreService
  ) {}

  /**
   * E-Mail aus Firebase Auth auslesen und Benutzerdaten aus Firestore laden.
   */
  ngOnInit() {
    this.mail = this.firestoreService.getCurrentAuthUser().email;
    this.userObservable = this.firestoreService
      .streamUserProfile()
      .subscribe((userModel) => {
        this.user = userModel;
      });
  }

  /**
   * Um mehrfach Subscriptions zu vermeiden werden alle Subscriptions abgemeldet.
   */
  ngOnDestroy() {
    this.userObservable.unsubscribe();
  }

  /**
   * Zurück zum Home Screen navigieren.
   */
  back() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  /**
   * Benutzer von Firebase Auth abmelden und zum Anmelde Screen navigieren.
   */
  async signOut() {
    // Ladeanzeige anzeigen
    const loading = await this.loadingController.create();
    await this.authService.signOut();
    // Ladeanzeige verstecken
    await loading.dismiss();
    this.router.navigateByUrl('signin', { replaceUrl: true });
  }
}
