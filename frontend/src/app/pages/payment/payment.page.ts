import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonSpinner, AlertController, ToastController
} from '@ionic/angular/standalone';
import { CartService } from '../../services/cart.service';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethod } from '../../models';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonSpinner],
  templateUrl: './payment.page.html',
  styleUrls:   ['./payment.page.scss'],
})
export class PaymentPage {
  selectedMethod: PaymentMethod = 'momo';
  loading   = false;

  methods = [
    { id: 'momo'  as PaymentMethod, icon: '📱', name: 'Mobile Money',      sub: 'MTN MoMo · Orange Money' },
    { id: 'card'  as PaymentMethod, icon: '💳', name: 'Debit / Credit Card', sub: 'Visa · Mastercard' },
    { id: 'table' as PaymentMethod, icon: '💵', name: 'Pay at Table',       sub: 'Cash or POS terminal' },
  ];
momoOperator = 'mtn';
momoPhone    = '';
cardNumber   = '';
cardExpiry   = '';
cardCvv      = '';
cardName     = '';

  constructor(
    public  cart:       CartService,
    private paymentSvc: PaymentService,
    private alert:      AlertController,
    private toast:      ToastController,
  ) {}

  selectMethod(m: PaymentMethod) { this.selectedMethod = m; }

  async pay() {
  if (this.cart.itemCount() === 0) {
    const t = await this.toast.create({ message: 'Your cart is empty', duration: 2000, position: 'top', color: 'warning' });
    await t.present(); return;
  }

  // Validate based on method
  if (this.selectedMethod === 'momo' && this.momoPhone.length < 9) {
    const t = await this.toast.create({ message: 'Please enter a valid mobile number', duration: 2000, position: 'top', color: 'warning' });
    await t.present(); return;
  }

  if (this.selectedMethod === 'card') {
    if (this.cardNumber.length < 16) {
      const t = await this.toast.create({ message: 'Please enter a valid card number', duration: 2000, position: 'top', color: 'warning' });
      await t.present(); return;
    }
    if (!this.cardExpiry || !this.cardCvv) {
      const t = await this.toast.create({ message: 'Please fill in all card details', duration: 2000, position: 'top', color: 'warning' });
      await t.present(); return;
    }
  }

  this.loading = true;
  this.paymentSvc.initiate({
    order_id:     1,
    method:       this.selectedMethod,
    phone_number: this.selectedMethod === 'momo'
      ? `+237${this.momoPhone}`
      : undefined,
  }).subscribe({
    next: async () => {
      this.loading = false;
      this.cart.clear();
      const a = await this.alert.create({
        header:  '✅ Payment Successful!',
        message: `Your payment of ${this.cart.total().toLocaleString()} XAF has been processed. Receipt sent to your email.`,
        buttons: ['Done'],
      });
      await a.present();
    },
    error: async () => {
      this.loading = false;
      const t = await this.toast.create({ message: 'Payment failed. Please try again.', duration: 2500, position: 'top', color: 'danger' });
      await t.present();
    },
  });
}
}
