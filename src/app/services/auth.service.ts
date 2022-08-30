import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth) {}

  /**
   * Erstellt ein neues Konto bei Firebase Auth
   *
   * @param email E-Mail des Benutzers
   * @param password Passwort des Bentzers
   * @returns Benutzerdaten wenn Vorgang erfolgreich, ansonsten null
   */
  async signUp({ email, password }) {
    try {
      const user = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Meldet den Benutzer bei Firebase Auth an
   *
   * @param email E-Mail des Benutzers
   * @param password Passwort des Bentzers
   * @returns Benutzerdaten wenn Vorgang erfolgreich, ansonsten null
   */
  async signIn({ email, password }) {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Setzt das Password des Benutzers zurück
   *
   * @param email E-Mail des Benutzers
   * @returns true wenn Vorgang erfolgreich
   */
  async resetPassword({ email }) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Meldet den Benutzer von Firebase Auth ab
   */
  async signOut() {
    await signOut(this.auth);
  }
}
