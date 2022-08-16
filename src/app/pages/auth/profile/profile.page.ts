import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FirestoreService } from '../../../services/firestore.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UserModel } from 'src/app/models/user.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  mail: string;
  user: UserModel = new UserModel();

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private firestoreService: FirestoreService
    ) {
    }

  ngOnInit() {
    this.mail = this.firestoreService.getCurrentAuthUser().email;
    this.firestoreService.getUserProfile().subscribe(res => {
      this.user = new UserModel('', res.firstname, res.lastname, res.addressline1, res.addressline2, res.postalcode, res.city);
    });
  }

  async signOut(){
    // Ladeanzeige anzeigen
    const loading = await this.loadingController.create();
    await this.authService.signOut();
    // Ladeanzeige verstecken
    await loading.dismiss();
    this.router.navigateByUrl('signin', {replaceUrl: true});
  }

}
