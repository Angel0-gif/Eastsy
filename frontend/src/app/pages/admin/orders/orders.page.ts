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
// 2. Imported system layout definitions from ionicons types
import { 
  cartOutline, 
  barChartOutline, 
  bookOutline, 
  easelOutline, 
  trendingUpOutline,
  chevronUpOutline,
  chevronDownOutline,
  callOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent,
    IonIcon // 3. Added to standalone template configurations
  ],
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class AdminOrdersPage {
  filterStatus = 'all';
  statuses = ['all','received','confirmed','preparing','on_the_way','delivered','paid'];

  orders = [
    { id:'ESY-2051', table:4, items:[{name:'Grilled Salmon',qty:1},{name:'Mango Juice',qty:2}], total:'16,500', status:'preparing',  time:'8:42 PM', phone:'+237 670 001 001' },
    { id:'ESY-2050', table:2, items:[{name:'Poulet DG',qty:1},{name:'Lemon Tart',qty:1}],       total:'12,000', status:'delivered',  time:'8:30 PM', phone:'+237 670 002 002' },
    { id:'ESY-2049', table:7, items:[{name:'Ndolé',qty:2},{name:'Bissap',qty:2}],               total:'18,000', status:'received',   time:'8:15 PM', phone:'+237 670 003 003' },
    { id:'ESY-2048', table:1, items:[{name:'Beef Brochettes',qty:1}],                           total:'6,000',  status:'paid',       time:'8:00 PM', phone:'+237 670 004 004' },
    { id:'ESY-2047', table:5, items:[{name:'Caesar Salad',qty:1},{name:'Salmon',qty:1}],        total:'16,000', status:'delivered',  time:'7:45 PM', phone:'+237 670 005 005' },
    { id:'ESY-2046', table:3, items:[{name:'Poulet DG',qty:2}],                                 total:'17,000', status:'paid',       time:'7:30 PM', phone:'+237 670 006 006' },
  ];

  expandedId: string | null = null;
  statusFlow = ['received','confirmed','preparing','on_the_way','delivered'];

  constructor(public router: Router, private toast: ToastController) {
    // 4. Bound operational vector iconography markers inside standalone lifecycle registry
    addIcons({
      cartOutline,
      barChartOutline,
      bookOutline,
      easelOutline,
      trendingUpOutline,
      chevronUpOutline,
      chevronDownOutline,
      callOutline
    });
  }

  get filtered() {
    return this.filterStatus === 'all'
      ? this.orders
      : this.orders.filter(o => o.status === this.filterStatus);
  }

  toggle(id: string) { this.expandedId = this.expandedId === id ? null : id; }

  async advance(order: any) {
    const idx = this.statusFlow.indexOf(order.status);
    if (idx < this.statusFlow.length - 1) {
      order.status = this.statusFlow[idx + 1];
      const t = await this.toast.create({ message:`Order ${order.id} → ${order.status}`, duration:2000, position:'top', color:'success' });
      await t.present();
    }
  }

  go(path: string) { this.router.navigate(['/admin/' + path]); }
}