import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonSpinner, ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonSpinner],
  template: `
<ion-content class="admin-login-content">
  <div class="admin-login-wrap">
    <div class="admin-logo">
      <span class="admin-badge">⚙️</span>
      <h1>EATSY Admin</h1>
      <p>Manager & Staff Portal</p>
    </div>
    <div class="admin-form">
      <div class="field-group">
        <label>Email</label>
        <input [(ngModel)]="email" type="email" placeholder="admin@eatsy.cm" class="ainput">
      </div>
      <div class="field-group">
        <label>Password</label>
        <input [(ngModel)]="password" type="password" placeholder="••••••••" class="ainput">
      </div>
      <ion-button expand="block" class="btn-admin-login" (click)="login()" [disabled]="loading">
        <ion-spinner *ngIf="loading" name="crescent" slot="start"></ion-spinner>
        {{ loading ? 'Signing in…' : 'Sign In as Admin' }}
      </ion-button>
      <p class="back-link" (click)="router.navigate(['/'])">← Back to App</p>
    </div>
  </div>
</ion-content>`,
  styles: [`
.admin-login-content { --background: #0a0f1a; }
.admin-login-wrap { display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding:0 28px; }
.admin-logo { text-align:center; margin-bottom:40px; }
.admin-badge { font-size:44px; display:block; margin-bottom:12px; }
h1 { font-size:26px; color:#60a5fa; font-family:'Georgia',serif; font-weight:normal; margin:0; letter-spacing:0.1em; }
p  { font-size:12px; color:#64748b; margin:6px 0 0; letter-spacing:0.15em; text-transform:uppercase; }
.admin-form { width:100%; }
.field-group { margin-bottom:14px; }
label { font-size:11px; color:#64748b; letter-spacing:0.1em; text-transform:uppercase; display:block; margin-bottom:6px; }
.ainput { width:100%; background:#111827; border:0.5px solid rgba(96,165,250,0.2); border-radius:10px; padding:13px 14px; font-size:14px; color:#f1f5f9; outline:none; font-family:inherit; }
.ainput:focus { border-color:#60a5fa; }
.btn-admin-login { --background:#60a5fa; --color:#0a0f1a; --border-radius:11px; font-family:'Georgia',serif; font-weight:bold; height:50px; margin-top:8px; }
.back-link { text-align:center; font-size:12px; color:#334155; margin-top:16px; cursor:pointer; }
.back-link:hover { color:#64748b; }
  `]
})
export class AdminLoginPage {
  email = 'admin@eatsy.cm';
  password = '';
  loading = false;

  constructor(public router: Router, private toast: ToastController) {}

  async login() {
    if (!this.password) {
      const t = await this.toast.create({ message: 'Please enter your password', duration: 2000, position: 'top', color: 'warning' });
      await t.present(); return;
    }
    this.loading = true;
    // In production: call AuthService with role check
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/admin/dashboard']);
    }, 1000);
  }
}
