import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async signOut(){
    await this.authService.signOut();
    this.router.navigateByUrl('/', {replaceUrl: true});
  }
}
