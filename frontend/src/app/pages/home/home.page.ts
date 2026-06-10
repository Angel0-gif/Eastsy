import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// Added new icon assets here
import { 
  cartOutline, 
  notificationsOutline, 
  bookOutline, 
  calendarOutline, 
  locateOutline, 
  starOutline, 
  restaurantOutline 
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { Order, User } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent,
  ],
  templateUrl: './home.page.html',
  styleUrls:   ['./home.page.scss'],
})
export class HomePage implements OnInit {
  user: User | null = null;
  recentOrders: Order[] = [];
  cartCount = 0;
  today = new Date();

  constructor(
    public  auth:   AuthService,
    private orders: OrderService,
    public  cart:   CartService,
    private router: Router,
  ) {
    // Registered all the new page icons inside the registry
    addIcons({ 
      cartOutline, 
      notificationsOutline, 
      bookOutline, 
      calendarOutline, 
      locateOutline, 
      starOutline, 
      restaurantOutline 
    });
  }

  ngOnInit() {
    this.user = this.auth.currentUser() as unknown as User;
    this.loadRecentOrders();
  }

  loadRecentOrders() {
    this.orders.getMyOrders().subscribe({
      next: res => this.recentOrders = res.results.slice(0, 3),
      error: () => {},
    });
  }

  handleRefresh(event: any) {
    this.loadRecentOrders();
    setTimeout(() => event.target.complete(), 1000);
  }

  goTo(path: string) { this.router.navigate(['/tabs/' + path]); }
}