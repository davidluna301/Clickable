import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService, FIREBASE_CONFIG } from '../services/auth.service';
import { ProgressService } from '../services/progress.service';
import { authGuard, moduleUnlockGuard } from './auth.guard';

describe('authGuard & moduleUnlockGuard', () => {
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

  it('blocks locked module and allows after previous module completion', async () => {
    const auth = TestBed.inject(AuthService);
    await auth.waitForAuthInit();
    await auth.registerWithEmail({
      firstName: 'Luis',
      lastName: 'Diaz',
      email: 'luis@example.com',
      password: 'Password123!',
    });

    const router = TestBed.inject(Router);
    const blocked = await TestBed.runInInjectionContext(() =>
      moduleUnlockGuard(
        { data: { moduleId: 'navegacion' } } as unknown as ActivatedRouteSnapshot,
        { url: '/game/modulo-2' } as RouterStateSnapshot
      )
    );

    expect(blocked instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(blocked as UrlTree)).toBe('/profile?locked=navegacion');

    const progress = TestBed.inject(ProgressService);
    progress.recordModuleCompletion('phishing', 60, 3, 5);

    const allowed = await TestBed.runInInjectionContext(() =>
      moduleUnlockGuard(
        { data: { moduleId: 'navegacion' } } as unknown as ActivatedRouteSnapshot,
        { url: '/game/modulo-2' } as RouterStateSnapshot
      )
    );

    expect(allowed).toBe(true);
  });
});
