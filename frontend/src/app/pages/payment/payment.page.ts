import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import {
  IonContent, IonIcon, IonButton, IonSpinner,
  IonHeader, IonToolbar, IonTitle,
  AlertController, ToastController, LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline, phonePortraitOutline, restaurantOutline,
  checkmarkCircleOutline, closeCircleOutline, lockClosedOutline,
} from 'ionicons/icons';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonButton, IonSpinner,
    IonHeader, IonToolbar, IonTitle,
  ],
  templateUrl: './payment.page.html',
  styleUrls:  ['./payment.page.scss'],
})
export class PaymentPage implements OnInit, OnDestroy {

  // ← public so the HTML template can access them
  public cart      = inject(CartService);
  private http     = inject(HttpClient);
  private router   = inject(Router);
  private alert    = inject(AlertController);
  private toast    = inject(ToastController);
  private loadCtrl = inject(LoadingController);

  selectedMethod = 'momo';
  momoOperator   = 'mtn';
  momoPhone      = '';
  cardNumber     = '';
  cardExpiry     = '';
  cardCvv        = '';
  cardName       = '';
  loading        = false;

  methods = [
    { id: 'momo',  name: 'Mobile Money', sub: 'MTN MoMo / Orange Money', icon: 'phone-portrait-outline' },
    { id: 'table', name: 'Pay at Table', sub: 'Cash or POS on arrival',  icon: 'restaurant-outline'     },
  ];

  private pollSub?: Subscription;

  constructor() {
    addIcons({
      cardOutline, phonePortraitOutline, restaurantOutline,
      checkmarkCircleOutline, closeCircleOutline, lockClosedOutline,
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  selectMethod(id: string) {
    this.selectedMethod = id;
  }

  async pay() {
    if (this.cart.itemCount() === 0) {
      await this.showToast('Your cart is empty.', 'warning');
      return;
    }

    if (this.selectedMethod === 'momo' && !this.momoPhone) {
      await this.showToast('Please enter your MoMo phone number.', 'warning');
      return;
    }

    const loader = await this.loadCtrl.create({ message: 'Creating order…' });
    await loader.present();

    const orderPayload = {
      items: this.cart.items().map((ci: any) => ({
        menu_item_id: ci.menu_item.id,
        quantity:     ci.quantity,
      })),
    };

    this.http.post<any>(`${environment.apiUrl}/orders/`, orderPayload).subscribe({
      next: async (order) => {
        await loader.dismiss();
        this.processPayment(order);
      },
      error: async () => {
        await loader.dismiss();
        await this.showToast('Could not create order. Please try again.', 'danger');
      },
    });
  }

  private async processPayment(order: any) {
    const loader = await this.loadCtrl.create({ message: 'Initiating payment…' });
    await loader.present();

    const payload: any = {
      order_id: order.id,
      method:   this.selectedMethod,
    };

    if (this.selectedMethod === 'momo') {
      const phone = this.momoPhone.startsWith('237')
        ? this.momoPhone
        : `237${this.momoPhone}`;
      payload.phone_number = phone;
    }

    this.http.post<any>(`${environment.apiUrl}/payments/initiate/`, payload).subscribe({
      next: async (res) => {
        await loader.dismiss();
        if (res.status === 'pending') {
          await this.showMomoWaitingAlert();
          this.startPolling(res.reference);
        } else {
          this.cart.clear();
          await this.showSuccessAlert();
        }
      },
      error: async (err) => {
        await loader.dismiss();
        const msg = err?.error?.detail || 'Payment failed. Please try again.';
        await this.showToast(msg, 'danger');
      },
    });
  }

  private startPolling(reference: string) {
    this.pollSub = interval(5000).pipe(
      switchMap(() =>
        this.http.get<any>(`${environment.apiUrl}/payments/status/${reference}/`)
      ),
      takeWhile((res) => res.status === 'pending', true),
    ).subscribe({
      next: async (res) => {
        if (res.status === 'success') {
          this.pollSub?.unsubscribe();
          this.cart.clear();
          await this.showSuccessAlert();
        } else if (res.status === 'failed') {
          this.pollSub?.unsubscribe();
          await this.showToast('Payment was declined or timed out. Please try again.', 'danger');
        }
      },
      error: () => {},
    });
  }

  private async showMomoWaitingAlert() {
    const phone = this.momoPhone.startsWith('237')
      ? this.momoPhone
      : `237${this.momoPhone}`;
    const a = await this.alert.create({
      header:  '📱 Check Your Phone',
      message: `A payment prompt has been sent to +${phone}. Please approve it within 2 minutes.`,
      buttons: ['OK'],
    });
    await a.present();
  }

  private async showSuccessAlert() {
    const a = await this.alert.create({
      header:  '✅ Payment Successful!',
      message: 'Your order has been confirmed. Bon appétit! 🍽️',
      buttons: [{
        text:    'Track Order',
        handler: () => this.router.navigate(['/tabs/tracking']),
      }],
    });
    await a.present();
  }

  private async showToast(message: string, color = 'success') {
    const t = await this.toast.create({
      message, duration: 3000, position: 'top', color,
    });
    await t.present();
  }
}