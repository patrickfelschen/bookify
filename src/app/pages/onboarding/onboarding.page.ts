import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonicSlides } from '@ionic/angular';

SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {
  @ViewChild(IonSlides) onboardingSlides: IonSlides;

  // Slider Einstellungen
  sliderOptions = {
    initialSlide: 0,
    speed: 1000, // Geschwindigkeit der Animation
    autoplay: {
      delay: 8000
    }
  };

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  /**
   * SplashScreen ausblenden
   * Autoplay nach Laden der Page starten
   */
  async ionViewWillEnter() {
    await SplashScreen.hide();
    this.onboardingSlides.startAutoplay();
  }

  /**
   * Autoplay nach Verlassen der Page stoppen
   * Ermöglicht bei wiederholtem Betreten des Onboardings erneutes Starten des Autoplays
   */
  ionViewWillLeave() {
    this.onboardingSlides.stopAutoplay();
  }

  /**
   * Überspringen des Onboardings, navigieren zur Page 'Home'
   */
  skip(): void {
    this.router.navigateByUrl('/signin', { replaceUrl: true });
  }
}
