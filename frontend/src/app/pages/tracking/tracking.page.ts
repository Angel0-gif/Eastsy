import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models';

interface TrackStep {
  key:    OrderStatus;
  label:  string;
  icon:   string;
  time?:  string;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton],
  templateUrl: './tracking.page.html',
  styleUrls:   ['./tracking.page.scss'],
})
export class TrackingPage implements OnInit, OnDestroy {
  order: Order | null = null;
  private sub?: Subscription;

  steps: TrackStep[] = [
    { key: 'received',   label: 'Order Received',       icon: '📋' },
    { key: 'confirmed',  label: 'Confirmed by Kitchen',  icon: '✅' },
    { key: 'preparing',  label: 'Being Prepared',        icon: '👨‍🍳' },
    { key: 'on_the_way', label: 'On the Way to Table',   icon: '🏃' },
    { key: 'delivered',  label: 'Enjoy Your Meal',       icon: '🍽️' },
  ];

  statusOrder: OrderStatus[] = ['received','confirmed','preparing','on_the_way','delivered'];

  constructor(private orderSvc: OrderService, private router: Router) {}

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
