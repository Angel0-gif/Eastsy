import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonInput, IonSpinner,
  ToastController,
  IonIcon // 1. Import IonIcon
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

// 2. Import addIcons and the specific icon
import { addIcons } from 'ionicons';
import { restaurantOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonButton,
    IonInput,
    IonSpinner,
    IonIcon // 3. Add to imports array
  ],
  templateUrl: './login.page.html',
  styleUrls:   ['./login.page.scss'],
})
export class LoginPage {
  email    = '';
  password = '';
  loading  = false;

  constructor(
    private auth:  AuthService,
    private toast: ToastController,
  ) {
    // 4. Register the icon for use
    addIcons({ restaurantOutline });
  }

  async onLogin() {
    // ... your existing login logic remains the same
    if (!this.email || !this.password) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (!this.email.includes('@')) {
      await this.showToast('Please enter a valid email address', 'warning');
      return;
    }

    this.loading = true;

    this.auth.login({
      email:    this.email.trim().toLowerCase(),
      password: this.password,
    }).subscribe({
      next: () => {
        this.loading = false;
      },
      error: async (err) => {
        this.loading = false;
        let msg = 'Login failed. Please try again.';
        if (err?.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error.detail) {
            msg = err.error.detail;
          } else if (err.error.non_field_errors) {
            msg = err.error.non_field_errors[0];
          } else if (typeof err.error === 'object') {
            const firstKey = Object.keys(err.error)[0];
            const firstVal = err.error[firstKey];
            msg = Array.isArray(firstVal) ? firstVal[0] : firstVal;
          }
        } else if (err?.status === 0) {
          msg = 'Cannot connect to server. Make sure the backend is running.';
        } else if (err?.status === 401) {
          msg = 'Invalid email or password.';
        } else if (err?.status === 400) {
          msg = 'Invalid email or password.';
        } else if (err?.status === 500) {
          msg = 'Server error. Please try again later.';
        }
        await this.showToast(msg, 'danger');
      },
    });
  }

  private async showToast(message: string, color: string = 'danger') {
    const t = await this.toast.create({
      message,
      duration: 5000,
      position: 'top',
      color,
    });
    await t.present();
  }
}