import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonIcon,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
// ✅ Cleaned up the unused duplicate restaurantOutline import from here

import { 
  cameraOutline, 
  calendarOutline, 
  timeOutline, 
  starOutline, 
  cardOutline, 
  notificationsOutline, 
  earthOutline, 
  lockClosedOutline, 
  logOutOutline, 
  mapOutline,
  chevronForwardOutline 
} from 'ionicons/icons';
import { AuthService, User } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonIcon
  ],
  templateUrl: './profile.page.html',
  styleUrls:   ['./profile.page.scss'],
})
export class ProfilePage {
  get user(): User | null { return this.auth.currentUser(); }

  menuItems = [
    { icon: 'calendar-outline', label: 'My Reservations', value: '3 upcoming',  route: 'reservation' },
    { icon: 'time-outline',     label: 'Order History',    value: '12 orders',   route: 'tracking' },
    { icon: 'star-outline',     label: 'Loyalty Points',   value: `${this.auth.currentUser()?.loyalty_points ?? 0} pts`, route: null },
    { icon: 'card-outline',     label: 'Payment Methods',  value: '2 saved',     route: null },
  ];

  settings = [
    { icon: 'notifications-outline', label: 'Notifications',    value: 'All on' },
    { icon: 'earth-outline',         label: 'Language',         value: 'English' },
    { icon: 'lock-closed-outline',   label: 'Privacy & Security', value: '' },
  ];

  constructor(
    public  auth:   AuthService,
    private router: Router,
    private alert:  AlertController,
    private http:   HttpClient,  
    private toast:  ToastController,
  ) {
    addIcons({
      cameraOutline,
      calendarOutline,
      timeOutline,
      starOutline,
      cardOutline,
      notificationsOutline,
      earthOutline,
      lockClosedOutline,
      logOutOutline,
      mapOutline,
      chevronForwardOutline
    });
  }

  navigate(route: string | null) {
    if (route) this.router.navigate(['/tabs/' + route]);
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const formData = new FormData();
    formData.append('avatar', file);

    this.http.patch(`${environment.apiUrl}/auth/me/`, formData).subscribe({
      next: (res: any) => {
        const current = this.auth.currentUser();
        if (current) {
          const avatarUrl = res.avatar
            ? (res.avatar.startsWith('http') ? res.avatar : `http://127.0.0.1:8000${res.avatar}`)
            : null;
          const updated = { ...current, avatar: avatarUrl };
          this.auth.currentUser.set(updated);
          localStorage.setItem('eatsy_user', JSON.stringify(updated));
        }
        this.showToast('Profile picture updated!');
      },
      error: () => this.showToast('Upload failed. Please try again.'),
    });
  }

  private async showToast(msg: string) {
    const t = await this.toast.create({ message: msg, duration: 2500, position: 'top', color: 'success' });
    await t.present();
  }

  async confirmLogout() {
    const a = await this.alert.create({
      header:  'Log Out',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Log Out', role: 'confirm', handler: () => this.auth.logout() },
      ],
      cssClass: 'eatsy-alert',
    });
    await a.present();
  }

  getAvatarUrl(avatar: string | null | undefined): string {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `http://127.0.0.1:8000${avatar}`;
  }

  openDirections() {
    window.open(
      'https://www.google.com/maps/dir/?api=1&destination=3.8667,11.5021&destination_place_id=EATSY+Restaurant+Yaounde',
      '_blank'
    );
  }
}