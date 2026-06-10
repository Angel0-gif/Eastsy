import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent, 
  IonButton,
  IonIcon, // 1. Dynamic architectural component resolution 
  AlertController, 
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// 2. Vector definitions imported for standalone runtime contexts
import { 
  bookOutline, 
  barChartOutline, 
  easelOutline, 
  cartOutline, 
  trendingUpOutline, 
  createOutline, 
  trashOutline,
  checkmarkCircle,
  closeCircle
} from 'ionicons/icons';
import { environment } from '../../../../environments/environment';

interface MenuItem {
  id:          number;
  name:        string;
  description: string;
  price:       number;
  category:    string;
  emoji:       string;
  available:   boolean;
  image?:      string | null;
}

@Component({
  selector:    'app-admin-menu',
  standalone:  true,
  imports:     [CommonModule, FormsModule, IonContent, IonButton, IonIcon], // 3. Registered inside definition layout
  templateUrl: './menu-management.page.html',
  styleUrls:   ['./menu-management.page.scss'],
})
export class AdminMenuPage implements OnInit {

  items: MenuItem[] = [];
  loading           = false;
  filterCat         = 'all';
  categories        = ['all', 'starter', 'main', 'dessert', 'drinks', 'special'];

  showForm  = false;
  editingId: number | null = null;

  form = {
    name:        '',
    description: '',
    price:       0,
    category:    'main',
    emoji:       '🍽️',
    available:   true,
  };

  imagePreview:  string | null = null;
  selectedImage: File | null   = null;

  constructor(
    public  router: Router,
    private alert:  AlertController,
    private toast:  ToastController,
    private http:   HttpClient,
  ) {
    // 4. Bound operational system layers into the component context setup
    addIcons({
      bookOutline,
      barChartOutline,
      easelOutline,
      cartOutline,
      trendingUpOutline,
      createOutline,
      trashOutline,
      checkmarkCircle,
      closeCircle
    });
  }

  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/menu/items/`).subscribe({
      next: res => {
        const raw  = res.results ?? res;
        this.items = raw.map((i: any) => ({
          id:          i.id,
          name:        i.name,
          description: i.description,
          price:       Number(i.price),
          category:    i.category,
          emoji:       i.emoji,
          available:   i.is_available,
          image:       i.image ?? null,
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; this.showToast('Failed to load menu items', 'danger'); },
    });
  }

  get filtered(): MenuItem[] {
    return this.filterCat === 'all'
      ? this.items
      : this.items.filter(i => i.category === this.filterCat);
  }

  openAdd() {
    this.editingId = null;
    this.form = { name:'', description:'', price:0, category:'main', emoji:'🍽️', available:true };
    this.imagePreview = null;
    this.selectedImage = null;
    this.showForm = true;
  }

  openEdit(item: MenuItem) {
    this.editingId = item.id;
    this.form = {
      name:        item.name,
      description: item.description,
      price:       item.price,
      category:    item.category,
      emoji:       item.emoji,
      available:   item.available,
    };
    this.imagePreview  = item.image ? this.getImageUrl(item.image) : null;
    this.selectedImage = null;
    this.showForm      = true;
  }

  cancel() {
    this.showForm = false;
    this.imagePreview = null;
    this.selectedImage = null;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedImage = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(this.selectedImage);
  }

  async save() {
    if (!this.form.name || !this.form.price) {
      await this.showToast('Name and price are required', 'warning');
      return;
    }

    const fd = new FormData();
    fd.append('name',         this.form.name);
    fd.append('description',  this.form.description || '');
    fd.append('price',        String(this.form.price));
    fd.append('category',     this.form.category);
    fd.append('emoji',        this.form.emoji || '🍽️');
    fd.append('is_available', this.form.available ? 'true' : 'false');
    if (this.selectedImage) {
      fd.append('image', this.selectedImage, this.selectedImage.name);
    }

    const api = `${environment.apiUrl}/menu/items/`;

    if (this.editingId !== null) {
      this.http.patch<any>(`${api}${this.editingId}/`, fd).subscribe({
        next: async (res) => {
          const idx = this.items.findIndex(i => i.id === this.editingId);
          if (idx !== -1) this.items[idx] = this.mapItem(res);
          this.cancel();
          await this.showToast('Item updated!', 'success');
        },
        error: async (err) => await this.showToast('Update failed: ' + this.getError(err), 'danger'),
      });
    } else {
      this.http.post<any>(api, fd).subscribe({
        next: async (res) => {
          this.items.push(this.mapItem(res));
          this.cancel();
          await this.showToast('Item added!', 'success');
        },
        error: async (err) => await this.showToast('Add failed: ' + this.getError(err), 'danger'),
      });
    }
  }

  async deleteItem(item: MenuItem) {
    const a = await this.alert.create({
      header: 'Delete Item',
      message: `Remove "${item.name}" from the menu?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'confirm', handler: async () => {
          this.http.delete(`${environment.apiUrl}/menu/items/${item.id}/`).subscribe({
            next: async () => { this.items = this.items.filter(i => i.id !== item.id); await this.showToast('Item deleted', 'success'); },
            error: async () => await this.showToast('Delete failed', 'danger'),
          });
        }},
      ],
    });
    await a.present();
  }

  toggleAvail(item: MenuItem) {
    this.http.patch<any>(`${environment.apiUrl}/menu/items/${item.id}/toggle/`, {}).subscribe({
      next: (res) => { item.available = res.is_available; },
      error: () => { item.available = !item.available; },
    });
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `http://127.0.0.1:8000${image}`;
  }

  go(path: string) { this.router.navigate(['/admin/' + path]); }

  private mapItem(i: any): MenuItem {
    return {
      id:          i.id,
      name:        i.name,
      description: i.description,
      price:       Number(i.price),
      category:    i.category,
      emoji:       i.emoji,
      available:   i.is_available,
      image:       i.image ?? null,
    };
  }

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