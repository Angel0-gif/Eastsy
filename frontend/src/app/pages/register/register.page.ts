import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonInput, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,
    IonContent, IonButton, IonInput, IonSpinner],
  template: `
<ion-content class="login-content">
  <div class="login-wrapper">
    <div class="login-logo-wrap">
      <h1 class="app-title">EATSY</h1>
      <p class="app-tagline">Create Account</p>
    </div>
    <div class="login-form">
      <div class="field-group">
        <label class="field-label">Full Name</label>
        <ion-input [(ngModel)]="fullName" type="text" placeholder="Your full name" class="eatsy-input"></ion-input>
      </div>
      <div class="field-group">
        <label class="field-label">Email</label>
        <ion-input [(ngModel)]="email" type="email" placeholder="you@example.com" class="eatsy-input"></ion-input>
      </div>
      <div class="field-group">
        <label class="field-label">Phone</label>
        <ion-input [(ngModel)]="phone" type="tel" placeholder="+237 6XX XXX XXX" class="eatsy-input"></ion-input>
      </div>
      <div class="field-group">
        <label class="field-label">Password</label>
        <ion-input [(ngModel)]="password" type="password" placeholder="Min. 8 characters" class="eatsy-input"></ion-input>
      </div>
      <div class="field-group">
        <label class="field-label">Confirm Password</label>
        <ion-input [(ngModel)]="password2" type="password" placeholder="Repeat password" class="eatsy-input"></ion-input>
      </div>
      <ion-button expand="block" class="btn-gold mt-16" (click)="onRegister()" [disabled]="loading">
        <ion-spinner *ngIf="loading" name="crescent" slot="start"></ion-spinner>
        {{ loading ? 'Creating…' : 'Register →' }}
      </ion-button>
      <p class="form-hint">Already have an account? <a routerLink="/login" class="link-gold">Sign in</a></p>
    </div>
  </div>
</ion-content>`,
  styleUrls: ['../login/login.page.scss'],
})
export class RegisterPage {
  fullName = ''; email = ''; phone = ''; password = ''; password2 = ''; loading = false;

  constructor(private auth: AuthService, private router: Router, private toast: ToastController) {}

  async onRegister() {
    if (!this.fullName || !this.email || !this.phone || !this.password) {
      await this.showToast('Please fill in all fields'); return;
    }
    if (this.password !== this.password2) {
      await this.showToast('Passwords do not match'); return;
    }
    this.loading = true;
    this.auth.register({ full_name: this.fullName, email: this.email, phone: this.phone, password: this.password, password2: this.password2 }).subscribe({
      next: () => this.router.navigate(['/tabs/home']),
      error: async () => { this.loading = false; await this.showToast('Registration failed. Please try again.'); },
    });
  }

  private async showToast(msg: string) {
    const t = await this.toast.create({ message: msg, duration: 2500, position: 'top', color: 'warning' });
    await t.present();
  }
}
