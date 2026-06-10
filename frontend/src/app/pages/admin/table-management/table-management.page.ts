import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { 
  IonContent, 
  ToastController, 
  AlertController,
  IonIcon // 1. Imported IonIcon component
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// 2. Imported asset definitions cleanly for administrative layouts
import { 
  easelOutline, 
  barChartOutline, 
  bookOutline, 
  cartOutline, 
  trendingUpOutline, 
  createOutline, 
  trashOutline 
} from 'ionicons/icons';
import { environment } from '../../../../environments/environment';

interface TableItem {
  id:       number;
  number:   number;
  seats:    number;
  status:   'available' | 'occupied' | 'reserved';
  location: string;
}

@Component({
  selector:    'app-admin-tables',
  standalone:  true,
  imports:     [CommonModule, FormsModule, IonContent, IonIcon], // 3. Added IonIcon to definitions array
  templateUrl: './table-management.page.html',
  styleUrls:   ['./table-management.page.scss'],
})
export class AdminTablesPage implements OnInit {

  tables: TableItem[] = [];
  loading = false;

  showForm  = false;
  editingId: number | null = null;
  form = { number: 0, seats: 2, location: 'Center', status: 'available' as TableItem['status'] };

  locations = ['Window', 'Center', 'Terrace', 'Bar', 'Private Room'];
  statuses  = ['available', 'occupied', 'reserved'];

  constructor(
    public  router: Router,
    private toast:  ToastController,
    private alert:  AlertController,
    private http:   HttpClient,
  ) {
    // 4. Registered operational layouts inside standalone builder pipeline
    addIcons({
      easelOutline,
      barChartOutline,
      bookOutline,
      cartOutline,
      trendingUpOutline,
      createOutline,
      trashOutline
    });
  }

  ngOnInit() { this.loadTables(); }

  loadTables() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/tables/`).subscribe({
      next: res => {
        const raw    = res.results ?? res;
        this.tables  = raw.map((t: any) => ({
          id:       t.id,
          number:   t.number,
          seats:    t.seats,
          status:   t.status,
          location: t.location || 'Main Hall',
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; this.showToast('Failed to load tables', 'danger'); },
    });
  }

  get summary() {
    return {
      available: this.tables.filter(t => t.status === 'available').length,
      occupied:  this.tables.filter(t => t.status === 'occupied').length,
      reserved:  this.tables.filter(t => t.status === 'reserved').length,
    };
  }

  openAdd() {
    this.editingId = null;
    this.form = { number: this.tables.length + 1, seats: 2, location: 'Center', status: 'available' };
    this.showForm = true;
  }

  openEdit(t: TableItem) {
    this.editingId = t.id;
    this.form = { number: t.number, seats: t.seats, location: t.location, status: t.status };
    this.showForm = true;
  }

  cancel() { this.showForm = false; }

  async save() {
    if (!this.form.number || !this.form.seats) {
      await this.showToast('Number and seats are required', 'warning');
      return;
    }

    const payload = {
      number:   this.form.number,
      seats:    this.form.seats,
      location: this.form.location,
      status:   this.form.status,
    };

    if (this.editingId !== null) {
      this.http.patch<any>(`${environment.apiUrl}/tables/${this.editingId}/`, payload).subscribe({
        next: async (res) => {
          const idx = this.tables.findIndex(t => t.id === this.editingId);
          if (idx !== -1) this.tables[idx] = { ...res, location: res.location || this.form.location };
          this.showForm = false;
          await this.showToast('Table updated!', 'success');
        },
        error: async (err) => await this.showToast('Update failed: ' + this.getError(err), 'danger'),
      });
    } else {
      this.http.post<any>(`${environment.apiUrl}/tables/`, payload).subscribe({
        next: async (res) => {
          this.tables.push({ ...res, location: res.location || this.form.location });
          this.showForm = false;
          await this.showToast('Table added! Clients can now book this table.', 'success');
        },
        error: async (err) => await this.showToast('Add failed: ' + this.getError(err), 'danger'),
      });
    }
  }

  cycleStatus(table: TableItem) {
    const order: TableItem['status'][] = ['available', 'occupied', 'reserved'];
    const next = order[(order.indexOf(table.status) + 1) % order.length];

    this.http.patch<any>(`${environment.apiUrl}/tables/${table.id}/`, { status: next }).subscribe({
      next: (res) => {
        table.status = res.status;
        this.showToast(`Table ${table.number} → ${res.status}`, 'success');
      },
      error: () => this.showToast('Status update failed', 'danger'),
    });
  }

  async deleteTable(table: TableItem) {
    const a = await this.alert.create({
      header:  'Delete Table',
      message: `Remove Table ${table.number}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'confirm', handler: async () => {
          this.http.delete(`${environment.apiUrl}/tables/${table.id}/`).subscribe({
            next: async () => {
              this.tables = this.tables.filter(t => t.id !== table.id);
              await this.showToast('Table deleted', 'success');
            },
            error: async () => await this.showToast('Delete failed', 'danger'),
          });
        }},
      ],
    });
    await a.present();
  }

  go(path: string) { this.router.navigate(['/admin/' + path]); }

  private getError(err: any): string {
    if (err?.error?.detail) return err.error.detail;
    if (typeof err?.error === 'object') {
      const key = Object.keys(err.error)[0];
      return `${key}: ${err.error[key]}`;
    }
    return 'Unknown error';
  }

  private async showToast(message: string, color = 'success') {
    const t = await this.toast.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }
}