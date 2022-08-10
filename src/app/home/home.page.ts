import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController
  ) { }


  async signOut(){
    // Ladeanzeige anzeigen
    const loading = await this.loadingController.create();
    await this.authService.signOut();
    // Ladeanzeige verstecken
    await loading.dismiss();
    this.router.navigateByUrl('signin', {replaceUrl: true});
  }
}
