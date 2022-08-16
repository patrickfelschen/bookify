import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController
    ) { }

  ngOnInit() {
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
