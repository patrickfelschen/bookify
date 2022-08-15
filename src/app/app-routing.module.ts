import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  canActivate,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToSignIn = () => redirectUnauthorizedTo(['signin']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  {
    path: 'onboarding',
    loadChildren: () => import('./pages/onboarding/onboarding.module').then( m => m.OnboardingPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToSignIn)
  },
  {
    path: 'signin',
    loadChildren: () => import('./pages/signin/signin.module').then( m => m.SigninPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'resetpassword',
    loadChildren: () => import('./pages/resetpassword/resetpassword.module').then( m => m.ResetpasswordPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'bookingoverview',
    loadChildren: () => import('./pages/bookingoverview/bookingoverview.module').then( m => m.BookingoverviewPageModule),
    ...canActivate(redirectUnauthorizedToSignIn)
  },
  {
    path: 'bookingservice',
    loadChildren: () => import('./pages/bookingservice/bookingservice.module').then( m => m.BookingservicePageModule),
    ...canActivate(redirectUnauthorizedToSignIn)
  },
  {
    path: '**',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
