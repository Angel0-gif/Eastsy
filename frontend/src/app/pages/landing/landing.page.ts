import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone'; // 1. Imported IonIcon

// 2. Imported icon registration utilities and specific icons
import { addIcons } from 'ionicons';
import { 
  restaurantOutline, 
  calendarOutline, 
  bookOutline, 
  cardOutline, 
  starOutline, 
  locateOutline, 
  lockClosedOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonIcon // 3. Added IonIcon to standalone imports
  ],
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideTimer: any;

  // 4. Converted 'emoji' strings to match their respective imported Ionic icon names
  slides = [
    { icon: 'calendar-outline', title: 'Reserve Your Table',    desc: 'Book in seconds, dine without waiting' },
    { icon: 'book-outline',     title: 'Browse Our Menu',       desc: 'Fresh ingredients, authentic Cameroonian flavours' },
    { icon: 'card-outline',     title: 'Pay Seamlessly',        desc: 'MTN MoMo, Orange Money, card — your choice' },
    { icon: 'star-outline',     title: 'Earn Loyalty Points',   desc: 'Every order rewards you with points and perks' },
  ];

  // 5. Converted 'icon' strings here as well
  features = [
    { icon: 'calendar-outline',  label: 'Easy Reservations' },
    { icon: 'locate-outline',    label: 'Live Order Tracking' },
    { icon: 'star-outline',      label: 'Loyalty Rewards' },
    { icon: 'lock-closed-outline', label: 'Secure Payments' },
  ];

  constructor(private router: Router) {
    // 6. Registered all icons inside the constructor so Ionic can bundle them properly
    addIcons({
      restaurantOutline,
      calendarOutline,
      bookOutline,
      cardOutline,
      starOutline,
      locateOutline,
      lockClosedOutline
    });
  }

  ngOnInit() {
    this.slideTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  ngOnDestroy() { 
    if (this.slideTimer) {
      clearInterval(this.slideTimer); 
    }
  }

  goToRegister() { this.router.navigate(['/register']); }

  goToLogin() { this.router.navigate(['/login']); }
}