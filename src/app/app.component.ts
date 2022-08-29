import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    if (Capacitor.isPluginAvailable('StatusBar')) {
      StatusBar.setBackgroundColor({color: '#0ca789'});
    }
  }
}
