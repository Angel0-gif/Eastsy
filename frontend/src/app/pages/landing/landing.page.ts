import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, IonContent],
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideTimer: any;

  slides = [
    { emoji: '🍽️', title: 'Reserve Your Table',   desc: 'Book in seconds, dine without waiting' },
    { emoji: '📖', title: 'Browse Our Menu',       desc: 'Fresh ingredients, authentic Cameroonian flavours' },
    { emoji: '💳', title: 'Pay Seamlessly',        desc: 'MTN MoMo, Orange Money, card — your choice' },
    { emoji: '⭐', title: 'Earn Loyalty Points',   desc: 'Every order rewards you with points and perks' },
  ];

  features = [
    { icon: '🗓️', label: 'Easy Reservations' },
    { icon: '🔴', label: 'Live Order Tracking' },
    { icon: '⭐', label: 'Loyalty Rewards' },
    { icon: '🔒', label: 'Secure Payments' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.slideTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    },5000);
  }

  ngOnDestroy() { clearInterval(this.slideTimer); }

  goToRegister() { this.router.navigate(['/register']); }

  // ONE login for everyone — admin@eatsy.cm goes to admin, others go to customer app
  goToLogin() { this.router.navigate(['/login']); }
}
