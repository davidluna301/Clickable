import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface SavedModuleCheckpoint {
  scenarioIndex: number;
  xp: number;
  lives: number;
  found: string[];
  wrong: string[];
  closed: boolean;
  threatsDetected: number;
  mistakesCount: number;
  updatedAt: string;
}

export interface ModuleProgress {
  id: string; // 'phishing', 'navegacion', 'celular', 'fraudes'
  order: number;
  route: string;
  name: string;
  subtitle: string;
  categoryTag: string;
  icon: string; // Google Fonts Material Symbol name
  totalScenarios: number;
  completed: boolean;
  unlocked: boolean;
  score: number; // best percentage (0 - 100)
  xpEarned: number;
  attempts: number;
  bestLives: number;
  threatsDetectedBest: number;
  checkpoint: SavedModuleCheckpoint | null;
}

export interface ActivityLog {
  id: string;
  title: string;
  detail: string;
  timestampLabel: string;
  xpText: string;
  icon: string; // Material Symbol name
  tone: 'positive' | 'neutral' | 'warning';
}

export interface BadgeProgress {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  icon: string; // Material Symbol name
  unlocked: boolean;
}

export interface UserStats {
  modulesCompleted: number;
  totalModules: number;
  xp: number;
  totalThreatsDetected: number;
  averageAccuracy: number;
  hasPlayedAny: boolean;
  totalAttempts: number;
  badgesUnlocked: number;
  streakDays: number;
  level: number;
  levelName: string;
  levelMinXp: number;
  levelMaxXp: number;
  levelProgressPct: number;
  xpToNextLevel: number;
}

interface StoredProgressState {
  modules: Partial<ModuleProgress>[];
  activities: ActivityLog[];
  streakDays: number;
  lastActiveDate: string;
}

const STORAGE_PREFIX = 'clickable_user_progress_v3_';
const LEGACY_V2_PREFIX = 'clickable_user_progress_v2_';

const ICON_FALLBACK_MAP: Record<string, string> = {
  '📧': 'mail',
  '🌐': 'public',
  '📱': 'smartphone',
  '💸': 'payments',
  '🛡️': 'shield',
  '🎯': 'track_changes',
};

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private auth = inject(AuthService);

  private readonly initialModules: Omit<ModuleProgress, 'unlocked'>[] = [
    {
      id: 'phishing',
      order: 1,
      route: '/game/modulo-1',
      name: 'Correos maliciosos',
      subtitle: 'Detecta suplantación de identidad, urgencia y adjuntos ejecutables.',
      categoryTag: 'Phishing & Email',
      icon: 'mail',
      totalScenarios: 3,
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
      bestLives: 0,
      threatsDetectedBest: 0,
      checkpoint: null,
    },
    {
      id: 'navegacion',
      order: 2,
      route: '/game/modulo-2',
      name: 'Navegación segura y web',
      subtitle: 'Analiza URLs, typosquatting, candado HTTPS, descargas y extensiones.',
      categoryTag: 'Web Segura',
      icon: 'public',
      totalScenarios: 4,
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
      bestLives: 0,
      threatsDetectedBest: 0,
      checkpoint: null,
    },
    {
      id: 'celular',
      order: 3,
      route: '/game/modulo-3',
      name: 'Seguridad en el celular',
      subtitle: 'Reconoce smishing, clones .apk, permisos abusivos y SIM swapping.',
      categoryTag: 'Móvil & SMS',
      icon: 'smartphone',
      totalScenarios: 4,
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
      bestLives: 0,
      threatsDetectedBest: 0,
      checkpoint: null,
    },
    {
      id: 'fraudes',
      order: 4,
      route: '/game/modulo-4',
      name: 'Fraudes financieros digitales',
      subtitle: 'Frena estafas en billeteras, QR alterados, vishing y links de pago.',
      categoryTag: 'Fraudes & QR',
      icon: 'payments',
      totalScenarios: 4,
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
      bestLives: 0,
      threatsDetectedBest: 0,
      checkpoint: null,
    },
    {
      id: 'redes-sociales',
      order: 5,
      route: '/game/modulo-5',
      name: 'Redes sociales e ingeniería social',
      subtitle: 'Detecta sorteos falsos, amigos clonados y falsas ofertas laborales.',
      categoryTag: 'Redes Sociales',
      icon: 'diversity_1',
      totalScenarios: 3,
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
      bestLives: 0,
      threatsDetectedBest: 0,
      checkpoint: null,
    },
    {
      id: 'wifi',
      order: 6,
      route: '/game/modulo-6',
      name: 'Wi-Fi público y portales cautivos',
      subtitle: 'Identifica redes gemelas (Evil Twin), portales con cobro y certificados.',
      categoryTag: 'Wi-Fi & Redes',
      icon: 'wifi',
      totalScenarios: 3,
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
      bestLives: 0,
      threatsDetectedBest: 0,
      checkpoint: null,
    },
    {
      id: 'inteligencia-artificial',
      order: 7,
      route: '/game/modulo-7',
      name: 'Inteligencia Artificial y Deepfakes',
      subtitle: 'Reconoce notas de voz clonadas (vishing), deepfakes y chatbots de soporte.',
      categoryTag: 'IA & Deepfakes',
      icon: 'psychology',
      totalScenarios: 3,
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
      bestLives: 0,
      threatsDetectedBest: 0,
      checkpoint: null,
    },
    {
      id: 'entorno-laboral',
      order: 8,
      route: '/game/modulo-8',
      name: 'Seguridad universitaria y laboral',
      subtitle: 'Neutraliza ataques de fatiga MFA (2FA), macros en Teams y falsos correos TI.',
      categoryTag: 'Trabajo & MFA',
      icon: 'apartment',
      totalScenarios: 3,
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
      bestLives: 0,
      threatsDetectedBest: 0,
      checkpoint: null,
    },
  ];

  private rawModules = signal<Omit<ModuleProgress, 'unlocked'>[]>(this.cloneInitialModules());
  activities = signal<ActivityLog[]>([]);
  streakDays = signal<number>(0);
  private lastActiveDate = '';
  private activeUid = 'guest';

  modules = computed<ModuleProgress[]>(() => {
    const list = this.rawModules();
    return list.map((mod, idx) => ({
      ...mod,
      unlocked: idx === 0 || list[idx - 1].completed,
    }));
  });

  badges = computed<BadgeProgress[]>(() => {
    const mods = this.modules();
    const completedCount = mods.filter((m) => m.completed).length;
    const totalAttempts = mods.reduce((sum, m) => sum + m.attempts, 0);
    const totalThreats = mods.reduce(
      (sum, m) => sum + Math.max(m.threatsDetectedBest, m.checkpoint?.threatsDetected || 0),
      0
    );
    const hasPerfectModule = mods.some((m) => m.completed && m.bestLives === 3);
    const phishingDone = mods.some((m) => m.id === 'phishing' && m.completed);
    const allModulesCompleted = completedCount === mods.length && mods.length > 0;

    const completedWithScore = mods.filter((m) => m.completed && m.score > 0);
    const avgScore =
      completedWithScore.length > 0
        ? Math.round(
            completedWithScore.reduce((sum, m) => sum + m.score, 0) / completedWithScore.length
          )
        : 0;
    const cyberSecurityBadgeUnlocked =
      allModulesCompleted || (completedCount >= 1 && avgScore >= 80);

    return [
      {
        id: 'first-step',
        title: 'Primer análisis',
        description: 'Completa tu primera inspección en el simulador.',
        requirementText: 'Detecta amenazas o completa 1 intento',
        icon: 'sports_esports',
        unlocked: totalAttempts >= 1 || totalThreats >= 1 || completedCount >= 1,
      },
      {
        id: 'phishing-hunter',
        title: 'Ojo anti-phishing',
        description: 'Superaste todas las trampas de correos maliciosos.',
        requirementText: 'Completa el Módulo 1',
        icon: 'mark_email_read',
        unlocked: phishingDone,
      },
      {
        id: 'zero-mistakes',
        title: 'Criterio impecable',
        description: 'Terminaste un módulo conservando las 3 vidas intactas.',
        requirementText: 'Completa un módulo con 3/3 vidas',
        icon: 'verified_user',
        unlocked: hasPerfectModule,
      },
      {
        id: 'ciberseguridad-elite',
        title: 'Insignia de Ciberseguridad UCC',
        description:
          'Certificación oficial de entrenamiento: dominaste todos los módulos formativos o alcanzaste al menos un 80% de precisión.',
        requirementText: 'Completa todos los módulos o logra ≥ 80% de precisión',
        icon: 'verified',
        unlocked: cyberSecurityBadgeUnlocked,
      },
      {
        id: 'master-guardian',
        title: 'Defensor Integral',
        description: 'Dominaste los 8 simuladores de ciberseguridad.',
        requirementText: 'Completa los 8 módulos formativos',
        icon: 'workspace_premium',
        unlocked: allModulesCompleted,
      },
    ];
  });

  readonly hasCyberSecurityBadge = computed(
    () => this.badges().find((b) => b.id === 'ciberseguridad-elite')?.unlocked ?? false
  );

  stats = computed<UserStats>(() => {
    const mods = this.modules();
    const completedMods = mods.filter((m) => m.completed);
    const completedCount = completedMods.length;
    const totalAttempts = mods.reduce((acc, m) => acc + m.attempts, 0);

    const moduleXp = mods.reduce((acc, m) => {
      const checkpointXp = m.checkpoint?.xp || 0;
      return acc + Math.max(m.xpEarned || 0, checkpointXp);
    }, 0);

    const totalThreatsDetected = mods.reduce(
      (acc, m) => acc + Math.max(m.threatsDetectedBest || 0, m.checkpoint?.threatsDetected || 0),
      0
    );

    const scoredModules = mods.filter((m) => m.score > 0);
    const averageAccuracy = scoredModules.length
      ? Math.round(scoredModules.reduce((acc, m) => acc + m.score, 0) / scoredModules.length)
      : 0;

    const badgesUnlocked = this.badges().filter((b) => b.unlocked).length;
    const hasPlayedAny =
      totalAttempts > 0 ||
      moduleXp > 0 ||
      totalThreatsDetected > 0 ||
      mods.some((m) => m.checkpoint !== null);

    const xpPerLevel = 120;
    const level = Math.floor(moduleXp / xpPerLevel) + 1;
    const levelMinXp = (level - 1) * xpPerLevel;
    const levelMaxXp = level * xpPerLevel;
    const levelProgressPct = Math.min(
      100,
      Math.max(0, Math.round(((moduleXp - levelMinXp) / xpPerLevel) * 100))
    );
    const xpToNextLevel = Math.max(0, levelMaxXp - moduleXp);

    const levelName =
      level >= 4
        ? 'Especialista en Defensa Digital'
        : level === 3
          ? 'Analista de Amenazas'
          : level === 2
            ? 'Detector Activo'
            : 'Aprendiz Digital';

    return {
      modulesCompleted: completedCount,
      totalModules: mods.length,
      xp: moduleXp,
      totalThreatsDetected,
      averageAccuracy,
      hasPlayedAny,
      totalAttempts,
      badgesUnlocked,
      streakDays: this.streakDays(),
      level,
      levelName,
      levelMinXp,
      levelMaxXp,
      levelProgressPct,
      xpToNextLevel,
    };
  });

  overallPercentage = computed(() => {
    const mods = this.modules();
    if (!mods.length) return 0;

    const unitWeight = 1 / mods.length;
    const progressSum = mods.reduce((acc, m) => {
      if (m.completed) return acc + unitWeight;
      if (m.checkpoint && m.totalScenarios > 0) {
        const partial = Math.min(0.9, m.checkpoint.scenarioIndex / m.totalScenarios);
        return acc + partial * unitWeight;
      }
      return acc;
    }, 0);

    return Math.round(progressSum * 100);
  });

  nextRecommendedModule = computed<ModuleProgress>(() => {
    const mods = this.modules();
    const inProgress = mods.find((m) => !m.completed && m.unlocked && m.checkpoint !== null);
    if (inProgress) return inProgress;
    return mods.find((m) => !m.completed && m.unlocked) || mods[0];
  });

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      const uid = user?.uid || 'guest';
      if (uid !== this.activeUid || !this.hasLoadedOnce) {
        this.activeUid = uid;
        this.loadStateForUser(uid);
      }
    });
  }

  private hasLoadedOnce = false;

  private ensureUserSynced() {
    const uid = this.auth.currentUser()?.uid || 'guest';
    if (uid !== this.activeUid || !this.hasLoadedOnce) {
      this.activeUid = uid;
      this.loadStateForUser(uid);
    }
  }

  private cloneInitialModules(): Omit<ModuleProgress, 'unlocked'>[] {
    return this.initialModules.map((m) => ({ ...m, checkpoint: null }));
  }

  private sanitizeIcon(raw: string | undefined, fallback: string): string {
    if (!raw) return fallback;
    return ICON_FALLBACK_MAP[raw] || raw;
  }

  private getStorageKey(uid: string): string {
    return `${STORAGE_PREFIX}${uid}`;
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private formatNowLabel(): string {
    try {
      return new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
    } catch {
      return 'Hoy';
    }
  }

  private loadStateForUser(uid: string) {
    this.hasLoadedOnce = true;
    const today = this.todayIso();
    try {
      const saved = localStorage.getItem(this.getStorageKey(uid));
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<StoredProgressState>;
        const mergedModules = this.initialModules.map((base) => {
          const found = parsed.modules?.find((p) => p.id === base.id);
          if (!found) return { ...base, checkpoint: null };
          return {
            ...base,
            completed: Boolean(found.completed),
            score: typeof found.score === 'number' ? found.score : 0,
            xpEarned: typeof found.xpEarned === 'number' ? found.xpEarned : 0,
            attempts: typeof found.attempts === 'number' ? found.attempts : 0,
            bestLives: typeof found.bestLives === 'number' ? found.bestLives : 0,
            threatsDetectedBest:
              typeof found.threatsDetectedBest === 'number' ? found.threatsDetectedBest : 0,
            checkpoint: found.checkpoint || null,
          };
        });

        let streak = typeof parsed.streakDays === 'number' ? parsed.streakDays : 0;
        const lastDate = parsed.lastActiveDate || '';
        if (lastDate && lastDate !== today && streak > 0) {
          const diffDays = Math.round(
            (new Date(today).getTime() - new Date(lastDate).getTime()) / 86_400_000
          );
          if (diffDays > 1) {
            streak = 0;
          }
        }

        const sanitizedActivities: ActivityLog[] = Array.isArray(parsed.activities)
          ? parsed.activities.map((a) => ({
              ...a,
              icon: this.sanitizeIcon(a.icon, 'shield'),
              detail: a.detail || '',
              timestampLabel: a.timestampLabel || 'Reciente',
              tone: a.tone || 'neutral',
            }))
          : [];

        this.rawModules.set(mergedModules);
        this.activities.set(sanitizedActivities);
        this.streakDays.set(streak);
        this.lastActiveDate = lastDate;
        this.saveState();
        return;
      }

      // Migrate real completed modules from v2 if present (without synthetic welcome XP)
      const legacyRaw = localStorage.getItem(`${LEGACY_V2_PREFIX}${uid}`);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as { modules?: Partial<ModuleProgress>[] };
        const migrated = this.initialModules.map((base) => {
          const found = legacy.modules?.find((p) => p.id === base.id);
          if (!found || (!found.completed && !found.attempts)) {
            return { ...base, checkpoint: null };
          }
          return {
            ...base,
            completed: Boolean(found.completed),
            score: typeof found.score === 'number' ? found.score : 0,
            xpEarned: typeof found.xpEarned === 'number' ? found.xpEarned : 0,
            attempts: typeof found.attempts === 'number' ? found.attempts : 0,
            bestLives: found.completed ? 3 : 0,
            threatsDetectedBest: found.completed ? 5 : 0,
            checkpoint: null,
          };
        });
        const hasRealLegacy = migrated.some((m) => m.completed || m.attempts > 0);
        this.rawModules.set(migrated);
        this.activities.set([]);
        this.streakDays.set(hasRealLegacy ? 1 : 0);
        this.lastActiveDate = hasRealLegacy ? today : '';
        this.saveState();
        return;
      }
    } catch (e) {
      console.warn('No se pudo leer el progreso desde localStorage', e);
    }

    // Fresh real user: 0 XP, 0% completed, Module 1 unlocked, 2-4 locked
    this.rawModules.set(this.cloneInitialModules());
    this.activities.set([]);
    this.streakDays.set(0);
    this.lastActiveDate = '';
    this.saveState();
  }

  private bumpStreakForToday() {
    const today = this.todayIso();
    if (!this.lastActiveDate) {
      this.streakDays.set(1);
    } else if (this.lastActiveDate !== today) {
      const diffDays = Math.round(
        (new Date(today).getTime() - new Date(this.lastActiveDate).getTime()) / 86_400_000
      );
      if (diffDays === 1) {
        this.streakDays.update((s) => Math.max(1, s + 1));
      } else {
        this.streakDays.set(1);
      }
    }
    this.lastActiveDate = today;
  }

  private saveState() {
    try {
      const state: StoredProgressState = {
        modules: this.rawModules(),
        activities: this.activities(),
        streakDays: this.streakDays(),
        lastActiveDate: this.lastActiveDate,
      };
      localStorage.setItem(this.getStorageKey(this.activeUid), JSON.stringify(state));
    } catch (e) {
      console.warn('No se pudo guardar el progreso en localStorage', e);
    }
  }

  isModuleUnlocked(moduleId: string): boolean {
    this.ensureUserSynced();
    const mod = this.modules().find((m) => m.id === moduleId);
    return mod ? mod.unlocked : false;
  }

  getModuleCheckpoint(moduleId: string): SavedModuleCheckpoint | null {
    this.ensureUserSynced();
    const mod = this.rawModules().find((m) => m.id === moduleId);
    return mod?.checkpoint || null;
  }

  saveModuleCheckpoint(moduleId: string, checkpoint: SavedModuleCheckpoint) {
    this.bumpStreakForToday();
    this.rawModules.update((mods) =>
      mods.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              threatsDetectedBest: Math.max(m.threatsDetectedBest, checkpoint.threatsDetected),
              checkpoint: { ...checkpoint, updatedAt: new Date().toISOString() },
            }
          : m
      )
    );
    this.saveState();
  }

  clearModuleCheckpoint(moduleId: string) {
    this.rawModules.update((mods) =>
      mods.map((m) => (m.id === moduleId ? { ...m, checkpoint: null } : m))
    );
    this.saveState();
  }

  recordModuleCompletion(
    moduleId: string,
    earnedXp: number,
    livesLeft: number,
    threatsDetected = 0
  ) {
    this.bumpStreakForToday();
    const score = Math.min(100, Math.round(55 + (livesLeft / 3) * 45));

    this.rawModules.update((mods) =>
      mods.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            completed: true,
            score: Math.max(m.score, score),
            xpEarned: Math.max(m.xpEarned, earnedXp),
            attempts: m.attempts + 1,
            bestLives: Math.max(m.bestLives, livesLeft),
            threatsDetectedBest: Math.max(m.threatsDetectedBest, threatsDetected),
            checkpoint: null,
          };
        }
        return m;
      })
    );

    const currentModules = this.modules();
    const mod = currentModules.find((m) => m.id === moduleId);
    const nextMod = mod ? currentModules.find((m) => m.order === mod.order + 1) : undefined;

    if (mod) {
      const newActivity: ActivityLog = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: `Completaste ${mod.name}`,
        detail: nextMod
          ? `Precisión ${score}% · Se desbloqueó el Módulo ${nextMod.order}`
          : `Precisión ${score}% · ${livesLeft}/3 vidas conservadas`,
        timestampLabel: `Hoy, ${this.formatNowLabel()}`,
        xpText: `+${earnedXp} XP`,
        icon: 'verified',
        tone: 'positive',
      };
      this.activities.update((list) => [newActivity, ...list.slice(0, 9)]);
    }

    this.saveState();
  }

  recordModuleAttempt(moduleId: string, earnedXp: number, threatsDetected = 0) {
    this.bumpStreakForToday();
    this.rawModules.update((mods) =>
      mods.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              attempts: m.attempts + 1,
              threatsDetectedBest: Math.max(m.threatsDetectedBest, threatsDetected),
              checkpoint: null,
            }
          : m
      )
    );

    const mod = this.rawModules().find((m) => m.id === moduleId);
    if (mod) {
      const newActivity: ActivityLog = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: `Intento en ${mod.name}`,
        detail: `${threatsDetected} señales detectadas · Reintenta para desbloquear el siguiente`,
        timestampLabel: `Hoy, ${this.formatNowLabel()}`,
        xpText: earnedXp > 0 ? `${earnedXp} XP práctica` : 'Repaso',
        icon: 'replay',
        tone: 'warning',
      };
      this.activities.update((list) => [newActivity, ...list.slice(0, 9)]);
    }

    this.saveState();
  }

  getModuleState(moduleId: string): 'completed' | 'current' | 'available' | 'locked' {
    const mods = this.modules();
    const index = mods.findIndex((m) => m.id === moduleId);
    if (index === -1) return 'locked';
    if (mods[index].completed) return 'completed';
    if (!mods[index].unlocked) return 'locked';
    const firstIncompleteIdx = mods.findIndex((m) => !m.completed && m.unlocked);
    if (index === firstIncompleteIdx) return 'current';
    return 'available';
  }

  resetProgress() {
    this.rawModules.set(this.cloneInitialModules());
    this.activities.set([]);
    this.streakDays.set(0);
    this.lastActiveDate = '';
    this.saveState();
  }
}
