import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { NativeGeocoder, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private nativeGeocoder: NativeGeocoder) {}

  /**
   * Ortet den Benutzer und liefert die Adresse mittels GeoCoder zurück
   *
   * @returns Adresse des Benutzers
   */
  async getCurrentAddress() {
    // Position auslesen
    const posOptions: PositionOptions = {
      enableHighAccuracy: true,
    };
    const coordinates = await Geolocation.getCurrentPosition(posOptions);
    // Adresse der Position ermitteln
    const geoOptions: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 1,
    };
    const geoResults = await this.nativeGeocoder.reverseGeocode(
      coordinates.coords.latitude,
      coordinates.coords.longitude,
      geoOptions
    );
    return geoResults[0];
  }
}

/* Docs
  https://capacitorjs.com/docs/apis/geolocation
  https://ionicframework.com/docs/native/native-geocoder
*/
