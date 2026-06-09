import { Component } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, bookOutline, calendarOutline,
  cardOutline, personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="menu">
          <ion-icon name="book-outline"></ion-icon>
          <ion-label>Menu</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="reservation">
          <ion-icon name="calendar-outline"></ion-icon>
          <ion-label>Reserve</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="payment">
          <ion-icon name="card-outline"></ion-icon>
          <ion-label>Pay</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, bookOutline, calendarOutline, cardOutline, personOutline });
  }
}
