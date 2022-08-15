import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookingoverviewPageRoutingModule } from './bookingoverview-routing.module';

import { BookingoverviewPage } from './bookingoverview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookingoverviewPageRoutingModule
  ],
  declarations: [BookingoverviewPage]
})
export class BookingoverviewPageModule {}
