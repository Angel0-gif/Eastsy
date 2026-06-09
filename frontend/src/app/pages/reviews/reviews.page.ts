import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonButton, IonModal, IonTextarea, IonSpinner,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { ReviewService } from '../../services/review.service';
import { Review, ReviewSummary } from '../../models';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonModal, IonTextarea, IonSpinner],
  templateUrl: './reviews.page.html',
  styleUrls:   ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {
  reviews: Review[]       = [];
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
  ) {}

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

  barPct(star: 1|2|3|4|5): number {
    if (!this.summary) return 0;
    return this.summary.distribution[star]
      ? Math.round((this.summary.distribution[star] / this.summary.total) * 100)
      : 0;
  }

  openForm()  { this.formOpen = true; }
  closeForm() { this.formOpen = false; }

  async submit() {
    if (!this.comment.trim()) {
      const t = await this.toast.create({ message: 'Please write a comment', duration: 2000, position: 'top', color: 'warning' });
      await t.present(); return;
    }
    this.submitting = true;
    this.reviewSvc.create({ rating: this.stars, comment: this.comment }).subscribe({
      next: async () => {
        this.submitting = false;
        this.closeForm();
        this.comment = '';
        this.stars   = 4;
        this.load();
        const a = await this.alert.create({
          header: '⭐ Thank You!',
          message: `Your ${this.stars}-star review has been submitted. We appreciate your feedback!`,
          buttons: ['Close'], cssClass: 'eatsy-alert',
        });
        await a.present();
      },
      error: async () => {
        this.submitting = false;
        const t = await this.toast.create({ message: 'Submission failed. Try again.', duration: 2500, position: 'top', color: 'danger' });
        await t.present();
      },
    });
  }
}
