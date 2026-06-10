import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonModal, IonTextarea, IonSpinner,
  ToastController, AlertController,
  IonIcon // 1. Imported IonIcon component
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// 2. Imported explicit star assets from ionicons definitions
import { star, starOutline } from 'ionicons/icons';
import { ReviewService } from '../../services/review.service';
import { Review, ReviewSummary } from '../../models';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonModal, IonTextarea, IonSpinner,
    IonIcon // 3. Included template component mapping
  ],
  templateUrl: './reviews.page.html',
  styleUrls:   ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {
  reviews:       Review[]       = [];
  summary: ReviewSummary | null = null;
  loading  = false;
  formOpen = false;
  stars    = 4;
  comment  = '';
  submitting = false;

  constructor(
    private reviewSvc: ReviewService,
    private toast:     ToastController,
    private alert:     AlertController,
  ) {
    // 4. Registered specific iconography items inside bundle compiler setup
    addIcons({ star, starOutline });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.reviewSvc.getSummary().subscribe({ next: s => this.summary = s, error: () => {} });
    this.reviewSvc.getAll().subscribe({
      next:  r => { this.reviews = r.results; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  setStars(n: number) { this.stars = n; }

  starsArray(n: number): boolean[] {
    return [1,2,3,4,5].map(i => i <= n);
  }

  barPct(starValue: 1|2|3|4|5): number {
    if (!this.summary) return 0;
    return this.summary.distribution[starValue]
      ? Math.round((this.summary.distribution[starValue] / this.summary.total) * 100)
      : 0;
  }

  openForm()  { this.formOpen = true; }
  closeForm() { this.formOpen = false; }

  async submit() {
  const submittedStars = this.stars;  // ← save before reset
  this.reviewSvc.create({ rating: this.stars, comment: this.comment }).subscribe({
    next: async () => {
      this.submitting = false;
      this.closeForm();
      this.comment = '';
      this.stars   = 4;
      this.load();
      const a = await this.alert.create({
        header:  '⭐ Thank You!',
        message: `Your ${submittedStars}-star review has been submitted!`,  // ← use saved value
        buttons: ['Close'],
      });
      await a.present();
    },
  });
}
}