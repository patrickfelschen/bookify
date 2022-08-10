import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResetpasswordPageRoutingModule } from './resetpassword-routing.module';

import { ResetpasswordPage } from './resetpassword.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetpasswordPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ResetpasswordPage]
})
export class ResetpasswordPageModule {}
