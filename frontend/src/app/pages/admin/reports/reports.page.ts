import { Component, OnInit } from '@angular/core';
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
  trendingUpOutline, printOutline, barChartOutline, bookOutline,
  easelOutline, cartOutline, cashOutline, peopleOutline, timeOutline
} from 'ionicons/icons';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class AdminReportsPage implements OnInit {
  selectedDate = new Date().toISOString().split('T')[0];

  report: any = {
    totalOrders:    0,
    totalRevenue:   0,
    avgOrderValue:  0,
    totalCovers:    0,
    peakHour:       '—',
    topItems:       [],
    paymentMethods: [],
    ordersByHour:   [],
    reservations:   { total: 0, confirmed: 0, cancelled: 0, noShow: 0 },
  };

  constructor(
    public  router: Router,
    private http:   HttpClient,    // ← ADDED
    private toast:  ToastController
  ) {
    addIcons({
      trendingUpOutline, printOutline, barChartOutline, bookOutline,
      easelOutline, cartOutline, cashOutline, peopleOutline, timeOutline
    });
  }

  ngOnInit() { this.loadReport(); }

  loadReport() {
    this.http.get<any>(
      `${environment.apiUrl}/reports/daily/?date=${this.selectedDate}`
    ).subscribe({
      next: res => {
        this.report = {
          totalOrders:    res.total_orders,
          totalRevenue:   res.total_revenue,
          avgOrderValue:  res.avg_order_value,
          totalCovers:    res.total_covers,
          peakHour:       res.peak_hour,
          topItems:       res.top_items       ?? [],
          paymentMethods: res.payment_methods ?? [],
          ordersByHour:   res.orders_by_hour  ?? [],
          reservations: {
            total:     res.reservations?.total     ?? 0,
            confirmed: res.reservations?.confirmed ?? 0,
            cancelled: res.reservations?.cancelled ?? 0,
            noShow:    res.reservations?.no_show   ?? 0,
          },
        };
      },
      error: async () => {
        const t = await this.toast.create({
          message: 'Failed to load report', duration: 2500,
          position: 'top', color: 'danger'
        });
        await t.present();
      }
    });
  }

  // Called when date changes
  onDateChange() { this.loadReport(); }

  maxBarCount() {
    if (!this.report.ordersByHour?.length) return 1;
    return Math.max(...this.report.ordersByHour.map((h: any) => h.count));
  }

  async printReport() {
    // ... keep your existing printReport() method exactly as is
  }

  go(path: string) { this.router.navigate(['/admin/' + path]); }
}