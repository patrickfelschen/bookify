import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookingservicePage } from './bookingservice.page';

const routes: Routes = [
  {
    path: '',
    component: BookingservicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingservicePageRoutingModule {}
