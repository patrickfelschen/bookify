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
    loadChildren: () => import('./onboarding/onboarding.module').then( m => m.OnboardingPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToSignIn)
  },
  {
    path: 'signin',
    loadChildren: () => import('./signin/signin.module').then( m => m.SigninPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'resetpassword',
    loadChildren: () => import('./resetpassword/resetpassword.module').then( m => m.ResetpasswordPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: '**',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
