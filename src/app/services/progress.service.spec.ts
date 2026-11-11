import { TestBed } from '@angular/core/testing';
import { AuthService, FIREBASE_CONFIG } from './auth.service';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: FIREBASE_CONFIG, useValue: null }],
    });
  });

  it('tracks module completion, XP, and badges per authenticated user', async () => {
    const auth = TestBed.inject(AuthService);
    await auth.waitForAuthInit();

    await auth.registerWithEmail({
      firstName: 'Carlos',
      lastName: 'Ruiz',
      email: 'carlos@example.com',
      password: 'Password123!',
    });

    const progress = TestBed.inject(ProgressService);
    TestBed.flushEffects();

    expect(progress.stats().modulesCompleted).toBe(0);
    expect(progress.overallPercentage()).toBe(0);

    progress.recordModuleCompletion('phishing', 50, 3);

    expect(progress.stats().modulesCompleted).toBe(1);
    expect(progress.overallPercentage()).toBe(25);
    expect(progress.stats().xp).toBe(70); // 20 base + 50 earned
    expect(progress.stats().badgesUnlocked).toBe(2); // Primer clic + Clic seguro
  });
});
