import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompleteprofilePageRoutingModule } from './completeprofile-routing.module';

import { CompleteprofilePage } from './completeprofile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompleteprofilePageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [CompleteprofilePage]
})
export class CompleteprofilePageModule {}
