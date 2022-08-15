import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookingwizardPageRoutingModule } from './bookingwizard-routing.module';

import { BookingwizardPage } from './bookingwizard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookingwizardPageRoutingModule
  ],
  declarations: [BookingwizardPage]
})
export class BookingwizardPageModule {}
