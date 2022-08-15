import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookingservicePageRoutingModule } from './bookingservice-routing.module';

import { BookingservicePage } from './bookingservice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookingservicePageRoutingModule
  ],
  declarations: [BookingservicePage]
})
export class BookingservicePageModule {}
