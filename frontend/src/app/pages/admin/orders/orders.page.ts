import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { 
  IonContent, 
  ToastController,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cartOutline, barChartOutline, bookOutline, easelOutline, 
  trendingUpOutline, chevronUpOutline, chevronDownOutline, callOutline 
} from 'ionicons/icons';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class AdminOrdersPage implements OnInit, OnDestroy {
  private refreshTimer: any;
  filterStatus = 'all';
  statuses = ['all','received','confirmed','preparing','on_the_way','delivered'];
  statusFlow = ['received','confirmed','preparing','on_the_way','delivered'];

  orders: any[] = [];   // ← now empty, filled from API
  expandedId: string | null = null;

  constructor(
    public  router: Router,
    private http:   HttpClient,   
    private toast:  ToastController
  ) {
    addIcons({
      cartOutline, barChartOutline, bookOutline, easelOutline,
      trendingUpOutline, chevronUpOutline, chevronDownOutline, callOutline
    });
  }

ngOnInit() {
  this.loadOrders();
  this.refreshTimer = setInterval(() => this.loadOrders(), 5000); // every 30s
}

ngOnDestroy() {
  if (this.refreshTimer) clearInterval(this.refreshTimer);
}

  loadOrders() {
    this.http.get<any>(`${environment.apiUrl}/orders/`).subscribe({
      next: res => {
        const raw = res.results ?? res;
        this.orders = raw.map((o: any) => ({
          realId: o.id,                         // ← real numeric ID for API calls
          id:     o.order_number,               // ← display ID e.g. ESY-2051
          table:  o.table?.number ?? '—',
          items:  o.items.map((i: any) => ({
            name: i.menu_item?.name ?? 'Item',
            qty:  i.quantity
          })),
          total:  Number(o.total).toLocaleString(),
          status: o.status,
          time:   new Date(o.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          }),
          phone: o.user_phone || '—',
        }));
      },
      error: async () => {
        const t = await this.toast.create({
          message: 'Failed to load orders', duration: 2500,
          position: 'top', color: 'danger'
        });
        await t.present();
      }
    });
  }

  get filtered() {
    return this.filterStatus === 'all'
      ? this.orders
      : this.orders.filter(o => o.status === this.filterStatus);
  }

  toggle(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  async advance(order: any) {
    const idx = this.statusFlow.indexOf(order.status);
    if (idx < this.statusFlow.length - 1) {
      const nextStatus = this.statusFlow[idx + 1];

      this.http.patch<any>(
        `${environment.apiUrl}/orders/${order.realId}/set_status/`,
        { status: nextStatus }
      ).subscribe({
        next: async () => {
          order.status = nextStatus;
          const t = await this.toast.create({
            message: `Order ${order.id} → ${nextStatus}`,
            duration: 2000, position: 'top', color: 'success'
          });
          await t.present();
        },
        error: async () => {
          const t = await this.toast.create({
            message: 'Status update failed', duration: 2500,
            position: 'top', color: 'danger'
          });
          await t.present();
        }
      });
    }
  }

  go(path: string) { this.router.navigate(['/admin/' + path]); }
}