import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, AuthUser } from '../services/auth.service';
import { ClassroomService } from '../services/classroom.service';
import { ActivityLog, ModuleProgress, ProgressService } from '../services/progress.service';
import { Profile } from './profile';

describe('Profile', () => {
  const mockUser = signal<AuthUser | null>({
    uid: 'u1',
    email: 'valentina@example.com',
    firstName: 'Valentina',
    lastName: 'Burbano',
    displayName: 'Valentina Burbano',
    photoURL: null,
    provider: 'google',
    emailVerified: true,
  });

  const mockModules = signal<ModuleProgress[]>([
    {
      id: 'phishing',
      order: 1,
      route: '/game/modulo-1',
      name: 'Correos maliciosos',
      subtitle: 'Detecta suplantaciones y adjuntos peligrosos',
      categoryTag: 'Phishing',
      icon: 'mail',
      totalScenarios: 3,
      completed: true,
      unlocked: true,
      score: 85,
      xpEarned: 120,
      attempts: 1,
      bestLives: 2,
      threatsDetectedBest: 6,
      checkpoint: null,
    },
  ]);

  const mockActivities = signal<ActivityLog[]>([
    {
      id: 'a1',
      title: 'Completaste Correos maliciosos',
      detail: 'Precisión 85% · Se desbloqueó el Módulo 2',
      timestampLabel: 'Hoy',
      xpText: '+120 XP',
      icon: 'verified',
      tone: 'positive',
    },
  ]);

  const authStub = {
    currentUser: mockUser.asReadonly(),
    userInitials: computed(() => 'VB'),
    logout: async () => undefined,
  };

  const progressStub = {
    modules: mockModules.asReadonly(),
    activities: mockActivities.asReadonly(),
    badges: signal([
      {
        id: 'b1',
        title: 'Primer filtro',
        description: 'Supera el Módulo 1',
        requirementText: 'Completa Módulo 1',
        icon: 'verified',
        unlocked: true,
      },
    ]).asReadonly(),
    stats: computed(() => ({
      modulesCompleted: 1,
      totalModules: 4,
      xp: 120,
      totalThreatsDetected: 6,
      averageAccuracy: 85,
      hasPlayedAny: true,
      totalAttempts: 1,
      badgesUnlocked: 1,
      streakDays: 1,
      level: 1,
      levelName: 'Aprendiz Digital',
      levelMinXp: 0,
      levelMaxXp: 200,
      levelProgressPct: 60,
      xpToNextLevel: 80,
    })),
    overallPercentage: computed(() => 25),
    hasCyberSecurityBadge: signal(true).asReadonly(),
    nextRecommendedModule: computed(() => mockModules()[0]),
    getModuleState: () => 'completed',
    clearModuleCheckpoint: () => undefined,
    resetProgress: () => undefined,
  };

  const classroomStub = {
    activeClassroom: signal({
      code: 'ELECTIVA-6A-UCC',
      name: 'Grupo 6A - Ingeniería de Sistemas',
      subject: 'Electiva de Seguridad Informática',
      institution: 'Universidad Cooperativa de Colombia (UCC)',
      teacherName: 'Prof. Ivonne Barco',
      teacherEmail: 'ivonne.barco@campusucc.edu.co',
      createdAt: '2026-10-15',
      students: [],
    }).asReadonly(),
    joinedClassCode: signal('ELECTIVA-6A-UCC').asReadonly(),
    joinClassroom: () => ({ success: true, message: 'Unido' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authStub },
        { provide: ProgressService, useValue: progressStub },
        { provide: ClassroomService, useValue: classroomStub },
      ],
    }).compileComponents();
  });

  it('renders recent activity cards and compact reset controls inside the sidebar container', () => {
    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const actList = host.querySelector('.act-compact-list');
    const actRow = host.querySelector('.act-compact-row');
    const resetBtn = host.querySelector('.reset-btn') as HTMLButtonElement | null;

    expect(actList).not.toBeNull();
    expect(actRow?.textContent).toContain('Completaste Correos maliciosos');
    expect(actRow?.textContent).toContain('+120 XP');
    expect(resetBtn?.textContent?.trim()).toBe('Reiniciar progreso');
    expect(host.querySelector('.provider-pill')?.textContent).toContain('Google');

    const comp = fixture.componentInstance;
    resetBtn?.click();
    fixture.detectChanges();
    expect(comp.confirmReset()).toBe(true);
    expect(host.querySelector('.reset-confirm-inline')?.textContent).toContain('¿Borrar XP?');
  });
});
