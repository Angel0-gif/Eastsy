import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [

  // ── LANDING ────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.page').then(m => m.LandingPage),
  },

  // ── SINGLE LOGIN (shared by admin and customers) ───
  // After login, auth.service.ts redirects based on is_admin flag
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then(m => m.RegisterPage),
  },

  // ── ADMIN (protected — is_admin=true only) ─────────
{
  path: 'admin',
  canActivate: [adminGuard],
  loadComponent: () =>
    import('./pages/admin/tabs/admin-tabs.page').then(m => m.AdminTabsPage),
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./pages/admin/dashboard/dashboard.page').then(m => m.AdminDashboardPage),
    },
    {
      path: 'menu',
      loadComponent: () =>
        import('./pages/admin/menu-management/menu-management.page').then(m => m.AdminMenuPage),
    },
    {
      path: 'tables',
      loadComponent: () =>
        import('./pages/admin/table-management/table-management.page').then(m => m.AdminTablesPage),
    },
    {
      path: 'orders',
      loadComponent: () =>
        import('./pages/admin/orders/orders.page').then(m => m.AdminOrdersPage),
    },
    {
      path: 'reports',
      loadComponent: () =>
        import('./pages/admin/reports/reports.page').then(m => m.AdminReportsPage),
    },
  ],
},

  // ── CUSTOMER APP (protected — logged in) ───────────
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./pages/menu/menu.page').then(m => m.MenuPage),
      },
      {
        path: 'reservation',
        loadComponent: () =>
          import('./pages/reservation/reservation.page').then(m => m.ReservationPage),
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./pages/payment/payment.page').then(m => m.PaymentPage),
      },
      {
        path: 'tracking',
        loadComponent: () =>
          import('./pages/tracking/tracking.page').then(m => m.TrackingPage),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./pages/reviews/reviews.page').then(m => m.ReviewsPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.page').then(m => m.ProfilePage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];
