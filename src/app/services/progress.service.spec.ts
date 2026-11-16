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

  it('starts new user at 0 XP, unlocks Module 1 only, persists checkpoints, and unlocks next module cleanly', async () => {
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
    expect(progress.stats().xp).toBe(0);
    expect(progress.stats().hasPlayedAny).toBe(false);
    expect(progress.isModuleUnlocked('phishing')).toBe(true);
    expect(progress.isModuleUnlocked('navegacion')).toBe(false);

    progress.saveModuleCheckpoint('phishing', {
      scenarioIndex: 1,
      xp: 30,
      lives: 3,
      found: ['from'],
      wrong: [],
      closed: false,
      threatsDetected: 3,
      mistakesCount: 0,
      updatedAt: new Date().toISOString(),
    });

    expect(progress.getModuleCheckpoint('phishing')?.scenarioIndex).toBe(1);
    expect(progress.stats().xp).toBe(30);
    expect(progress.stats().hasPlayedAny).toBe(true);

    progress.recordModuleCompletion('phishing', 50, 3, 4);

    expect(progress.stats().modulesCompleted).toBe(1);
    expect(progress.overallPercentage()).toBe(13);
    expect(progress.stats().xp).toBe(50);
    expect(progress.stats().totalThreatsDetected).toBe(4);
    expect(progress.stats().badgesUnlocked).toBe(4); // Primer análisis + Ojo anti-phishing + Criterio impecable + Insignia Ciberseguridad (score 100% >= 80%)
    expect(progress.isModuleUnlocked('navegacion')).toBe(true);
    expect(progress.isModuleUnlocked('celular')).toBe(false);
    expect(progress.getModuleCheckpoint('phishing')).toBeNull();
  });
});
