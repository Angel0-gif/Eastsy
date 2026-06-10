import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonIcon // 1. Imported IonIcon component
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
// 2. Imported specific system assets for the timeline tracking matrix
import { 
  receiptOutline, 
  checkmarkCircleOutline, 
  flameOutline, 
  walkOutline, 
  restaurantOutline 
} from 'ionicons/icons';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models';

interface TrackStep {
  key:    OrderStatus;
  label:  string;
  icon:   string; // Replaces emoji symbols with matching ionic registration strings
  time?:  string;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonIcon // 3. Registered IonIcon inside imports array boundary
  ],
  templateUrl: './tracking.page.html',
  styleUrls:   ['./tracking.page.scss'],
})
export class TrackingPage implements OnInit, OnDestroy {
  order: Order | null = null;
  private sub?: Subscription;

  // 4. Converted hardcoded string indicators to Ionic outline labels
  steps: TrackStep[] = [
    { key: 'received',   label: 'Order Received',       icon: 'receipt-outline' },
    { key: 'confirmed',  label: 'Confirmed by Kitchen',  icon: 'checkmark-circle-outline' },
    { key: 'preparing',  label: 'Being Prepared',        icon: 'flame-outline' },
    { key: 'on_the_way', label: 'On the Way to Table',   icon: 'walk-outline' },
    { key: 'delivered',  label: 'Enjoy Your Meal',       icon: 'restaurant-outline' },
  ];

  statusOrder: OrderStatus[] = ['received','confirmed','preparing','on_the_way','delivered'];

  constructor(private orderSvc: OrderService, private router: Router) {
    // 5. Registered asset values cleanly in constructor framework loading lifecycle
    addIcons({ 
      receiptOutline, 
      checkmarkCircleOutline, 
      flameOutline, 
      walkOutline, 
      restaurantOutline 
    });
  }

  ngOnInit() {
    // Load latest active order (id=1 as demo; production: pass from navigation state)
    this.orderSvc.getById(1).subscribe({
      next: o => this.order = o,
      error: () => {},
    });
    // Poll for live updates
    this.sub = this.orderSvc.trackOrder(1).subscribe({
      next: o => this.order = o,
      error: () => {},
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  stepState(step: TrackStep): 'done' | 'active' | 'wait' {
    if (!this.order) return 'wait';
    const current = this.statusOrder.indexOf(this.order.status);
    const stepIdx = this.statusOrder.indexOf(step.key);
    if (stepIdx < current)  return 'done';
    if (stepIdx === current) return 'active';
    return 'wait';
  }

  goToPay() { this.router.navigate(['/tabs/payment']); }
}