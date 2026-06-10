import { Component, OnInit, OnDestroy  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { 
  IonContent, 
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
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
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  today = new Date();
  private refreshTimer: any;

  stats = [
    { label: 'Orders Today',   value: '—',   icon: 'cart-outline',     trend: '', up: true },
    { label: 'Revenue Today',  value: '—',   icon: 'cash-outline',     trend: '', up: true },
    { label: 'Reservations',   value: '—',   icon: 'calendar-outline', trend: '', up: true },
    { label: 'Tables Active',  value: '—',   icon: 'easel-outline',    trend: '', up: true },
  ];

  recentOrders: any[] = [];

  menuItems = [
    { name: 'Ndolé & Plantains', cat: 'Main',    price: '7,500',  available: true  },
    { name: 'Poulet DG',         cat: 'Main',    price: '8,500',  available: true  },
    { name: 'Grilled Salmon',    cat: 'Main',    price: '12,500', available: true  },
    { name: 'Beef Brochettes',   cat: 'Starter', price: '6,000',  available: false },
    { name: 'Lemon Tart',        cat: 'Dessert', price: '3,500',  available: true  },
  ];

  constructor(
    public  router: Router,
    private http:   HttpClient,
  ) {
    addIcons({
      settingsOutline, barChartOutline, bookOutline, easelOutline,
      cartOutline, trendingUpOutline, cashOutline, calendarOutline,
      addOutline, documentTextOutline
    });
  }

  ngOnInit() {
  this.loadDashboard();
  this.refreshTimer = setInterval(() => this.loadDashboard(), 5000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  loadDashboard() {
    // Load dashboard stats
    this.http.get<any>(`${environment.apiUrl}/reports/dashboard/`).subscribe({
      next: res => {
        this.stats[0].value = String(res.orders_today);
        this.stats[1].value = res.revenue_today > 0 ? (res.revenue_today / 1000).toFixed(0) + 'k XAF' : '0 XAF';
        this.stats[2].value = String(res.reservations_today);
        // First get total tables count
this.http.get<any>(`${environment.apiUrl}/tables/`).subscribe({
  next: tables => {
    const total = (tables.results ?? tables).length;
    this.stats[3].value = `${res.tables_occupied}/${total}`;
  },
  error: () => {
    this.stats[3].value = `${res.tables_occupied}/12`;
  }
});
      },
      error: () => {} // keep default '—' values on error
    });

    // Load recent orders
    this.http.get<any>(`${environment.apiUrl}/orders/`).subscribe({
      next: res => {
        const raw = res.results ?? res;
        this.recentOrders = raw.slice(0, 5).map((o: any) => ({
          id:     o.order_number,
          table:  o.table?.number ?? '—',
          total:  Number(o.total).toLocaleString(),
          status: o.status,
          time:   new Date(o.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          }),
        }));
      },
      error: () => {}
    });
  }

  go(path: string) { this.router.navigate(['/admin/' + path]); }
  logout()         { this.router.navigate(['/']); }
}