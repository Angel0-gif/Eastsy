import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonSearchbar, IonChip, IonLabel, IonButtons, IonButton, IonIcon,
  IonModal, IonList, IonItem, IonThumbnail, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// Added restaurantOutline to the import list
import { cartOutline, addOutline, removeOutline, restaurantOutline } from 'ionicons/icons';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { MenuItem, MenuCategory } from '../../models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonSearchbar, IonChip, IonLabel, IonButtons, IonButton, IonIcon,
    IonModal, IonList, IonItem, IonThumbnail,
  ],
  templateUrl: './menu.page.html',
  styleUrls:   ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  items:      MenuItem[] = [];
  categories: { value: MenuCategory | 'all'; label: string }[] = [
    { value: 'all',     label: 'All' },
    { value: 'starter', label: 'Starters' },
    { value: 'main',    label: 'Mains' },
    { value: 'dessert', label: 'Desserts' },
    { value: 'drinks',  label: 'Drinks' },
    { value: 'special', label: 'Specials' },
  ];
  activeCategory: MenuCategory | 'all' = 'all';
  searchQuery = '';
  selectedItem: MenuItem | null = null;
  detailQty = 1;
  isDetailOpen = false;
  loading = false;

  constructor(
    private menuSvc: MenuService,
    public  cart:    CartService,
    private toast:   ToastController,
  ) {
    // Registered restaurantOutline here to handle the empty state icon
    addIcons({ cartOutline, addOutline, removeOutline, restaurantOutline });
  }

  ngOnInit() { this.loadMenu(); }

  loadMenu() {
    this.loading = true;
    const cat = this.activeCategory === 'all' ? undefined : this.activeCategory;
    this.menuSvc.getAll(cat, this.searchQuery || undefined).subscribe({
      next: res => { this.items = res.results; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  selectCategory(cat: MenuCategory | 'all') {
    this.activeCategory = cat;
    this.loadMenu();
  }

  onSearch(event: any) {
    this.searchQuery = event.detail.value ?? '';
    this.loadMenu();
  }

  openDetail(item: MenuItem) {
    this.selectedItem = item;
    this.detailQty    = 1;
    this.isDetailOpen = true;
  }

  closeDetail() { this.isDetailOpen = false; }

  chgQty(d: number) { this.detailQty = Math.max(1, this.detailQty + d); }

  async addFromDetail() {
    if (!this.selectedItem) return;
    for (let i = 0; i < this.detailQty; i++) this.cart.addItem(this.selectedItem);
    this.closeDetail();
    const t = await this.toast.create({
      message:  `${this.selectedItem.name} ×${this.detailQty} added to cart`,
      duration: 2000, position: 'top', color: 'success',
    });
    await t.present();
  }

  quickAdd(item: MenuItem, event: Event) {
    event.stopPropagation();
    this.cart.addItem(item);
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `http://127.0.0.1:8000${image}`;
  }
}