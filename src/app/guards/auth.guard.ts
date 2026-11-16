import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProgressService } from '../services/progress.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuth = await auth.waitForAuthInit();
  if (isAuth) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuth = await auth.waitForAuthInit();
  if (!isAuth) {
    return true;
  }

  return router.createUrlTree(['/profile']);
};

export const moduleUnlockGuard: CanActivateFn = async (route) => {
  const progress = inject(ProgressService);
  const router = inject(Router);
  const moduleId = route.data?.['moduleId'] as string | undefined;

  if (!moduleId || progress.isModuleUnlocked(moduleId)) {
    return true;
  }

  return router.createUrlTree(['/profile'], {
    queryParams: { locked: moduleId },
  });
};
