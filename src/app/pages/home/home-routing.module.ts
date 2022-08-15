import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'booking-creation',
    loadChildren: () => import('./booking-creation/booking-creation.module').then( m => m.BookingCreationPageModule)
  },
  {
    path: 'bookingwizard',
    loadChildren: () => import('./bookingwizard/bookingwizard.module').then( m => m.BookingwizardPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
