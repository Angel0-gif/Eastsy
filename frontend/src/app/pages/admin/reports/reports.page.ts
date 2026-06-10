import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  ToastController,
  IonIcon // 1. Imported IonIcon component
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// 2. Imported specific system layouts for reports layout
import { 
  trendingUpOutline,
  printOutline,
  barChartOutline,
  bookOutline,
  easelOutline,
  cartOutline,
  cashOutline,
  peopleOutline,
  timeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent,
    IonIcon // 3. Registered IonIcon inside imports boundary
  ],
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class AdminReportsPage {
  selectedDate = new Date().toISOString().split('T')[0];
  today = new Date();

  report = {
    date:           new Date(),
    totalOrders:    24,
    totalRevenue:   186500,
    avgOrderValue:  7771,
    totalCovers:    61,
    peakHour:       '7:30 PM – 8:30 PM',
    topItems: [
      { name: 'Poulet DG',         emoji: '🍗', sold: 8,  revenue: 68000 },
      { name: 'Grilled Salmon',    emoji: '🐟', sold: 5,  revenue: 62500 },
      { name: 'Ndolé & Plantains', emoji: '🫘', sold: 7,  revenue: 52500 },
      { name: 'Mango Juice',       emoji: '🥭', sold: 14, revenue: 28000 },
      { name: 'Lemon Tart',        emoji: '🍋', sold: 6,  revenue: 21000 },
    ],
    paymentMethods: [
      { method:'Mobile Money', count:14, pct:58 },
      { method:'Card',         count:6,  pct:25 },
      { method:'Pay at Table', count:4,  pct:17 },
    ],
    ordersByHour: [
      { hour:'12PM', count:3 }, { hour:'1PM',  count:2 },
      { hour:'6PM',  count:4 }, { hour:'7PM',  count:7 },
      { hour:'8PM',  count:6 }, { hour:'9PM',  count:2 },
    ],
    reservations: { total:8, confirmed:7, cancelled:1, noShow:0 },
  };

  constructor(public router: Router, private toast: ToastController) {
    // 4. Bound operational vector configurations inside standalone context registry
    addIcons({
      trendingUpOutline,
      printOutline,
      barChartOutline,
      bookOutline,
      easelOutline,
      cartOutline,
      cashOutline,
      peopleOutline,
      timeOutline
    });
  }

  maxBarCount() { return Math.max(...this.report.ordersByHour.map(h => h.count)); }

  async printReport() {
    // Build a clean printable HTML page from current report data
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EATSY Daily Report — ${this.selectedDate}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Georgia, serif; color: #111; padding: 32px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #c9a84c; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 28px; letter-spacing: 0.2em; color: #c9a84c; }
          .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
          .report-date { font-size: 14px; color: #444; text-align: right; }
          h2 { font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin: 24px 0 10px; border-bottom: 0.5px solid #ddd; padding-bottom: 6px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
          .kpi { background: #f9f6ee; border: 1px solid #e8d9a0; border-radius: 8px; padding: 14px; text-align: center; }
          .kpi-val { font-size: 22px; font-weight: bold; color: #c9a84c; }
          .kpi-lbl { font-size: 11px; color: #888; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f5f0e0; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; border-bottom: 1px solid #ddd; }
          td { padding: 8px 10px; border-bottom: 0.5px solid #eee; color: #333; }
          tr:last-child td { border-bottom: none; }
          .pay-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; }
          .pay-bar-bg { flex: 1; height: 6px; background: #eee; border-radius: 3px; }
          .pay-bar-fill { height: 100%; background: #c9a84c; border-radius: 3px; }
          .res-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .res-item { background: #f9f6ee; border-radius: 8px; padding: 12px; text-align: center; }
          .res-val { font-size: 20px; font-weight: bold; color: #c9a84c; }
          .res-lbl { font-size: 11px; color: #888; margin-top: 3px; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 0.5px solid #ddd; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">EATSY</div>
            <div class="subtitle">Daily Operations Report</div>
          </div>
          <div class="report-date">
            <strong>Date:</strong> ${this.selectedDate}<br>
            <strong>Generated:</strong> ${new Date().toLocaleString()}
          </div>
        </div>

        <h2>Key Metrics</h2>
        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${this.report.totalOrders}</div><div class="kpi-lbl">Total Orders</div></div>
          <div class="kpi"><div class="kpi-val">${this.report.totalRevenue.toLocaleString()}</div><div class="kpi-lbl">Revenue (XAF)</div></div>
          <div class="kpi"><div class="kpi-val">${this.report.avgOrderValue.toLocaleString()}</div><div class="kpi-lbl">Avg Order (XAF)</div></div>
          <div class="kpi"><div class="kpi-val">${this.report.totalCovers}</div><div class="kpi-lbl">Covers Served</div></div>
        </div>
        <p style="font-size:12px;color:#888;margin-top:8px;">⏰ Peak Hour: <strong>${this.report.peakHour}</strong></p>

        <h2>Top Selling Items</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Item</th><th>Qty Sold</th><th>Revenue (XAF)</th></tr>
          </thead>
          <tbody>
            ${this.report.topItems.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.emoji} ${item.name}</td>
                <td>${item.sold}</td>
                <td>${item.revenue.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Payment Methods</h2>
        ${this.report.paymentMethods.map(p => `
          <div class="pay-row">
            <span style="width:120px;">${p.method}</span>
            <div class="pay-bar-bg"><div class="pay-bar-fill" style="width:${p.pct}%"></div></div>
            <span style="width:36px;text-align:right;">${p.pct}%</span>
            <span style="width:70px;text-align:right;color:#888;">${p.count} orders</span>
          </div>
        `).join('')}

        <h2>Reservations Summary</h2>
        <div class="res-grid">
          <div class="res-item"><div class="res-val">${this.report.reservations.total}</div><div class="res-lbl">Total</div></div>
          <div class="res-item"><div class="res-val">${this.report.reservations.confirmed}</div><div class="res-lbl">Confirmed</div></div>
          <div class="res-item"><div class="res-val">${this.report.reservations.cancelled}</div><div class="res-lbl">Cancelled</div></div>
          <div class="res-item"><div class="res-val">${this.report.reservations.noShow}</div><div class="res-lbl">No-Show</div></div>
        </div>

        <div class="footer">
          <span>EATSY Restaurant · Yaoundé, Cameroun</span>
          <span>Université Saint Jean Ingénieur · 2025–2026</span>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      const t = await this.toast.create({
        message: 'Please allow popups to export PDF',
        duration: 3000, position: 'top', color: 'warning'
      });
      await t.present();
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    const t = await this.toast.create({
      message: 'Print dialog opened — choose "Save as PDF"',
      duration: 3000, position: 'top', color: 'success'
    });
    await t.present();
  }

  go(path: string) { this.router.navigate(['/admin/' + path]); }
}