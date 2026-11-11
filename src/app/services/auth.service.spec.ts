import { TestBed } from '@angular/core/testing';
import { AuthService, FIREBASE_CONFIG } from './auth.service';

describe('AuthService (local fallback when Firebase config is placeholder)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: FIREBASE_CONFIG, useValue: null }],
    });
  });

  it('registers a user, logs in, and logs out cleanly', async () => {
    const auth = TestBed.inject(AuthService);
    await auth.waitForAuthInit();
    expect(auth.isAuthenticated()).toBe(false);

    const registered = await auth.registerWithEmail({
      firstName: 'María',
      lastName: 'García',
      email: 'maria@example.com',
      password: 'Password123!',
    });

    expect(registered.displayName).toBe('María García');
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.userInitials()).toBe('MG');

    await auth.logout();
    expect(auth.isAuthenticated()).toBe(false);

    const logged = await auth.loginWithEmail('maria@example.com', 'Password123!', true);
    expect(logged.firstName).toBe('María');
    expect(auth.isAuthenticated()).toBe(true);
  });
});
