import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protects all /admin/* routes. Only is_admin=true users can enter. */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAdmin) {
    return true;
  }

  // Not logged in → go to landing
  // Logged in but not admin → go to customer app
  if (auth.isLoggedIn()) {
    router.navigate(['/tabs/home']);
  } else {
    router.navigate(['/']);
  }
  return false;
};

/** Protects customer /tabs/* routes. */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};
