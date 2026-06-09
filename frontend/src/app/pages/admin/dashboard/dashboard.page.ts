import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonContent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  today = new Date();

  stats = [
    { label: 'Orders Today',   value: '24',    icon: '🛒', trend: '+3',  up: true },
    { label: 'Revenue Today',  value: '186k',  icon: '💰', trend: '+12%', up: true },
    { label: 'Reservations',   value: '8',     icon: '📅', trend: '+2',  up: true },
    { label: 'Tables Active',  value: '5/8',   icon: '🪑', trend: '',    up: true },
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

  constructor(public router: Router) {}
  ngOnInit() {}

  go(path: string) { this.router.navigate(['/admin/' + path]); }
  logout()         { this.router.navigate(['/']); }
}
