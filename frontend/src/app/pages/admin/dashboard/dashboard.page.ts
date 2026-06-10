import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonIcon // 1. Imported IonIcon component
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// 2. Imported explicit system assets for navigation, metrics, and actions
import { 
  settingsOutline,
  barChartOutline, 
  bookOutline, 
  easelOutline, 
  cartOutline, 
  trendingUpOutline,
  cashOutline,
  calendarOutline,
  addOutline,
  documentTextOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    IonContent,
    IonIcon // 3. Registered IonIcon inside imports boundary
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  today = new Date();

  // 4. Mapped stat objects to structural asset tracking strings
  stats = [
    { label: 'Orders Today',   value: '24',    icon: 'cart-outline',          trend: '+3',   up: true },
    { label: 'Revenue Today',  value: '186k',  icon: 'cash-outline',          trend: '+12%', up: true },
    { label: 'Reservations',   value: '8',     icon: 'calendar-outline',      trend: '+2',   up: true },
    { label: 'Tables Active',  value: '5/8',   icon: 'easel-outline',         trend: '',     up: true },
  ];

  recentOrders = [
    { id: 'ESY-2051', table: 4, items: 3, total: '24,500', status: 'preparing',  time: '8:42 PM' },
    { id: 'ESY-2050', table: 2, items: 2, total: '16,000', status: 'delivered',  time: '8:30 PM' },
    { id: 'ESY-2049', table: 7, items: 4, total: '31,500', status: 'received',   time: '8:15 PM' },
    { id: 'ESY-2048', table: 1, items: 1, total: '8,500',  status: 'delivered',  time: '8:00 PM' },
    { id: 'ESY-2047', table: 5, items: 3, total: '19,000', status: 'paid',       time: '7:45 PM' },
  ];

  menuItems = [
    { name: 'Ndolé & Plantains', cat: 'Main',    price: '7,500',  available: true  },
    { name: 'Poulet DG',         cat: 'Main',    price: '8,500',  available: true  },
    { name: 'Grilled Salmon',    cat: 'Main',    price: '12,500', available: true  },
    { name: 'Beef Brochettes',   cat: 'Starter', price: '6,000',  available: false },
    { name: 'Lemon Tart',        cat: 'Dessert', price: '3,500',  available: true  },
  ];

  constructor(public router: Router) {
    // 5. Registered asset values cleanly in constructor lifecycle runtime builder
    addIcons({
      settingsOutline,
      barChartOutline,
      bookOutline,
      easelOutline,
      cartOutline,
      trendingUpOutline,
      cashOutline,
      calendarOutline,
      addOutline,
      documentTextOutline
    });
  }

  ngOnInit() {}

  go(path: string) { this.router.navigate(['/admin/' + path]); }
  logout()         { this.router.navigate(['/']); }
}