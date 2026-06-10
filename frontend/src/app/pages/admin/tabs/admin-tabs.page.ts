import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barChartOutline, bookOutline, easelOutline,
  cartOutline, trendingUpOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard">
          <ion-icon name="bar-chart-outline"></ion-icon>
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="menu">
          <ion-icon name="book-outline"></ion-icon>
          <ion-label>Menu</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="tables">
          <ion-icon name="easel-outline"></ion-icon>
          <ion-label>Tables</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="orders">
          <ion-icon name="cart-outline"></ion-icon>
          <ion-label>Orders</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="reports">
          <ion-icon name="trending-up-outline"></ion-icon>
          <ion-label>Reports</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    ion-tab-bar {
      --background: #0f1623;
      --border: 0.5px solid rgba(96,165,250,0.12);
      --color: #64748b;
      --color-selected: #60a5fa;
    }
    ion-tab-button {
      --color: #64748b;
      --color-selected: #60a5fa;
      ion-label { font-size: 10px; }
    }
  `]
})
export class AdminTabsPage {
  constructor() {
    addIcons({
      barChartOutline, bookOutline, easelOutline,
      cartOutline, trendingUpOutline
    });
  }
}