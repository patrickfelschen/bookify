import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingModel } from 'src/app/models/booking.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-bookingoverview',
  templateUrl: './bookingoverview.page.html',
  styleUrls: ['./bookingoverview.page.scss'],
})
export class BookingoverviewPage implements OnInit {
  inFuture: boolean;

  currentBooking: BookingModel;

  constructor(private router: Router, private firestoreService: FirestoreService, private alertController: AlertController) {
    if(this.router.getCurrentNavigation().extras.state) {
      this.currentBooking = this.router.getCurrentNavigation().extras.state.currentBooking;
      this.inFuture = this.currentBooking.date.start > Timestamp.fromDate(new Date()).toMillis();
    }
  }

  ngOnInit() {
    console.log(this.inFuture);
  }

  async cancelBooking() {
    const alert = await this.alertController.create({
      header: 'Termin stornieren?',
      message:
      'Soll der Termin storniert werden?',
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: () => {
            this.firestoreService.deleteUserBooking(this.currentBooking);
            this.router.navigateByUrl('home', { replaceUrl: true });
          },
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
            this.alertController.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }

  callNumber(phoneNumber: string) {
    window.open('tel:' + phoneNumber);
  }
}
