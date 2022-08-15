import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookingwizardPage } from './bookingwizard.page';

const routes: Routes = [
  {
    path: '',
    component: BookingwizardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingwizardPageRoutingModule {}
