import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService, FIREBASE_CONFIG } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: FIREBASE_CONFIG, useValue: null }],
    });
  });

  it('redirects unauthenticated users to /login with returnUrl', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/profile' } as RouterStateSnapshot)
    );

    expect(result instanceof UrlTree).toBe(true);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fprofile');
  });

  it('allows authenticated users through', async () => {
    const auth = TestBed.inject(AuthService);
    await auth.waitForAuthInit();
    await auth.registerWithEmail({
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
      password: 'Password123!',
    });

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/game/modulo-1' } as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });
});
