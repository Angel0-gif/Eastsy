import { Component, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonSelect, IonSelectOption,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

interface Table {
  id:     number;
  number: number;
  seats:  number;
  status: 'available' | 'occupied' | 'reserved';
}

@Component({
  selector:    'app-reservation',
  standalone:  true,
  imports:     [CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonSelect, IonSelectOption],
  templateUrl: './reservation.page.html',
  styleUrls:   ['./reservation.page.scss'],
})
export class ReservationPage implements OnInit, OnDestroy{
  today = new Date().toISOString().split('T')[0];

  date             = new Date().toISOString().split('T')[0];
  time             = '19:00';
  guests           = 2;
  special          = '';
  tables: Table[]  = [];
  selectedTableId: number | null = null;
  loading          = false;
  tablesLoading    = false;
  private refreshTimer: any;

  timeSlots = [
    { label: '12:00 PM', value: '12:00', available: false },
    { label: '12:30 PM', value: '12:30', available: false },
    { label: '1:00 PM',  value: '13:00', available: true  },
    { label: '7:00 PM',  value: '19:00', available: true  },
    { label: '7:30 PM',  value: '19:30', available: true  },
    { label: '8:00 PM',  value: '20:00', available: true  },
    { label: '8:30 PM',  value: '20:30', available: true  },
    { label: '9:00 PM',  value: '21:00', available: false },
    { label: '9:30 PM',  value: '21:30', available: true  },
  ];

  constructor(
    private http:  HttpClient,
    private alert: AlertController,
    private toast: ToastController,
  ) {}

  ngOnInit() { 
    this.loadTables();
    // Auto-refresh every 30 seconds
    this.refreshTimer = setInterval(() => this.loadTables(), 30000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  // ── Always loads LIVE table data from backend ─────────────
  // This means: when admin adds/changes a table, clients see it immediately
  loadTables() {
    this.tablesLoading   = true;
    this.selectedTableId = null;

    // The interceptor adds the auth token automatically
    this.http.get<any>(
      `${environment.apiUrl}/tables/?date=${this.date}&time=${this.time}`
    ).subscribe({
      next: res => {
        const raw     = res.results ?? res;
        this.tables   = raw.map((t: any) => ({
          id:     t.id,
          number: t.number,
          seats:  t.seats,
          status: t.status as Table['status'],
        }));
        this.tablesLoading = false;
      },
      error: () => {
        this.tablesLoading = false;
        this.showToast('Could not load tables. Check your connection.', 'warning');
      },
    });
  }

  onDateChange()   { this.loadTables(); }

  selectTime(slot: any) {
    if (!slot.available) return;
    this.time = slot.value;
    this.loadTables();  // refresh availability for new time
  }

  selectTable(table: Table) {
    if (table.status !== 'available') {
      this.showToast(`Table ${table.number} is ${table.status}`, 'warning');
      return;
    }
    this.selectedTableId = table.id;
  }

  async confirm() {
    if (!this.selectedTableId) {
      await this.showToast('Please select a table first', 'warning');
      return;
    }

    this.loading = true;

    // Auth interceptor adds token automatically
    this.http.post<any>(`${environment.apiUrl}/reservations/`, {
      date:             this.date,
      time:             this.time + ':00',
      guest_count:      this.guests,
      table_id:         this.selectedTableId,
      special_requests: this.special,
    }).subscribe({
      next: async (res) => {
        this.loading = false;
        const tableNum = this.tables.find(t => t.id === this.selectedTableId)?.number;
        const a = await this.alert.create({
          header:  '🎉 Reservation Confirmed!',
          message: `Table ${tableNum} for ${this.guests} guest(s) on ${this.date} at ${this.time}. A confirmation SMS will be sent shortly.`,
          buttons: ['Great!'],
        });
        await a.present();
        this.special         = '';
        this.selectedTableId = null;
        this.loadTables();  // refresh so booked table shows as reserved
      },
      error: async (err) => {
        this.loading = false;
        const msg = err?.error?.table_id?.[0]
          || err?.error?.detail
          || 'Reservation failed. Please try again.';
        await this.showToast(msg, 'danger');
      },
    });
  }

  private async showToast(message: string, color = 'success') {
    const t = await this.toast.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }
}
