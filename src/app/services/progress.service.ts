import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface ModuleProgress {
  id: string; // 'phishing', 'navegacion', 'celular', 'fraudes'
  route: string;
  name: string;
  subtitle: string;
  icon: string;
  completed: boolean;
  score: number; // percentage (0 - 100)
  xpEarned: number;
  attempts: number;
}

export interface ActivityLog {
  id: string;
  title: string;
  timeAgo: string;
  xpText: string;
  icon: string;
}

export interface UserStats {
  modulesCompleted: number;
  totalModules: number;
  xp: number;
  badgesUnlocked: number;
  streakDays: number;
  level: number;
  levelName: string;
  levelMaxXp: number;
}

interface StoredProgressState {
  modules: ModuleProgress[];
  activities: ActivityLog[];
  baseXp: number;
  streakDays: number;
  lastActiveDate: string;
}

const STORAGE_PREFIX = 'clickable_user_progress_v2_';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private auth = inject(AuthService);

  private readonly initialModules: ModuleProgress[] = [
    {
      id: 'phishing',
      route: '/game/modulo-1',
      name: 'Correos maliciosos (Phishing)',
      subtitle: 'Detecta phishing, enlaces falsos y adjuntos',
      icon: '📧',
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
    },
    {
      id: 'navegacion',
      route: '/game/modulo-2',
      name: 'Navegación segura y web',
      subtitle: 'HTTPS, extensiones y sitios clonados',
      icon: '🌐',
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
    },
    {
      id: 'celular',
      route: '/game/modulo-3',
      name: 'Seguridad en el celular',
      subtitle: 'Apps falsas, permisos abusivos y SMS',
      icon: '📱',
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
    },
    {
      id: 'fraudes',
      route: '/game/modulo-4',
      name: 'Fraudes financieros digitales',
      subtitle: 'Nequi/Daviplata, QR falsos y llamadas',
      icon: '💸',
      completed: false,
      score: 0,
      xpEarned: 0,
      attempts: 0,
    },
  ];

  modules = signal<ModuleProgress[]>(this.cloneInitialModules());
  activities = signal<ActivityLog[]>([]);
  baseXp = signal<number>(20);
  streakDays = signal<number>(1);
  private lastActiveDate = '';
  private activeUid = 'guest';

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      const uid = user?.uid || 'guest';
      this.activeUid = uid;
      this.loadStateForUser(uid);
    });
  }

  private cloneInitialModules(): ModuleProgress[] {
    return this.initialModules.map((m) => ({ ...m }));
  }

  private getStorageKey(uid: string): string {
    return `${STORAGE_PREFIX}${uid}`;
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private loadStateForUser(uid: string) {
    const today = this.todayIso();
    try {
      const saved = localStorage.getItem(this.getStorageKey(uid));
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<StoredProgressState>;
        const mergedModules = this.initialModules.map((m) => {
          const found = parsed.modules?.find((p) => p.id === m.id);
          return found ? { ...m, ...found } : { ...m };
        });

        let streak = typeof parsed.streakDays === 'number' ? parsed.streakDays : 1;
        const lastDate = parsed.lastActiveDate || today;
        if (lastDate !== today) {
          const diffDays = Math.round(
            (new Date(today).getTime() - new Date(lastDate).getTime()) / 86_400_000
          );
          if (diffDays === 1) {
            streak += 1;
          } else if (diffDays > 1) {
            streak = 1;
          }
        }

        this.modules.set(mergedModules);
        this.activities.set(
          Array.isArray(parsed.activities) && parsed.activities.length
            ? parsed.activities
            : this.defaultActivities()
        );
        this.baseXp.set(typeof parsed.baseXp === 'number' ? parsed.baseXp : 20);
        this.streakDays.set(streak);
        this.lastActiveDate = today;
        this.saveState();
        return;
      }
    } catch (e) {
      console.warn('No se pudo leer el progreso desde localStorage', e);
    }

    // Usuario nuevo
    this.modules.set(this.cloneInitialModules());
    this.activities.set(this.defaultActivities());
    this.baseXp.set(20);
    this.streakDays.set(1);
    this.lastActiveDate = today;
    this.saveState();
  }

  private defaultActivities(): ActivityLog[] {
    return [
      {
        id: 'welcome',
        title: 'Cuenta lista para entrenar',
        timeAgo: 'Hoy',
        xpText: '+20 XP',
        icon: '🛡️',
      },
    ];
  }

  private saveState() {
    try {
      const state: StoredProgressState = {
        modules: this.modules(),
        activities: this.activities(),
        baseXp: this.baseXp(),
        streakDays: this.streakDays(),
        lastActiveDate: this.lastActiveDate || this.todayIso(),
      };
      localStorage.setItem(this.getStorageKey(this.activeUid), JSON.stringify(state));
    } catch (e) {
      console.warn('No se pudo guardar el progreso en localStorage', e);
    }
  }

  stats = computed<UserStats>(() => {
    const mods = this.modules();
    const completedCount = mods.filter((m) => m.completed).length;
    const hasAnyAttempt = mods.some((m) => m.attempts > 0 || m.completed);
    const earnedXp = mods.reduce((acc, cur) => acc + (cur.xpEarned || 0), 0);
    const totalXp = this.baseXp() + earnedXp;

    let badges = 0;
    if (hasAnyAttempt || completedCount >= 1) badges++; // Primer clic
    if (completedCount >= 1) badges++; // Clic seguro
    if (completedCount >= 2) badges++; // Detective
    if (completedCount === mods.length && mods.length > 0) badges++; // Experto

    const level = Math.floor(totalXp / 150) + 1;
    const levelName =
      level >= 4
        ? 'Maestro de la Ciberseguridad'
        : level >= 3
          ? 'Explorador digital'
          : level >= 2
            ? 'Defensor activo'
            : 'Aprendiz digital';
    const levelMaxXp = level * 150;

    return {
      modulesCompleted: completedCount,
      totalModules: mods.length,
      xp: totalXp,
      badgesUnlocked: badges,
      streakDays: this.streakDays(),
      level,
      levelName,
      levelMaxXp,
    };
  });

  overallPercentage = computed(() => {
    const mods = this.modules();
    if (!mods.length) return 0;
    const completed = mods.filter((m) => m.completed).length;
    return Math.round((completed / mods.length) * 100);
  });

  nextRecommendedModule = computed<ModuleProgress>(() => {
    const mods = this.modules();
    return mods.find((m) => !m.completed) || mods[0];
  });

  recordModuleCompletion(moduleId: string, earnedXp: number, livesLeft: number) {
    const score = Math.min(100, Math.round(55 + (livesLeft / 3) * 45));

    this.modules.update((mods) =>
      mods.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            completed: true,
            score: Math.max(m.score, score),
            xpEarned: Math.max(m.xpEarned, earnedXp),
            attempts: m.attempts + 1,
          };
        }
        return m;
      })
    );

    const mod = this.modules().find((m) => m.id === moduleId);
    if (mod) {
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        title: `Completado: ${mod.name} (${score}%)`,
        timeAgo: 'Justo ahora',
        xpText: `+${earnedXp} XP`,
        icon: mod.icon,
      };
      this.activities.update((list) => [newActivity, ...list.slice(0, 7)]);
    }

    this.saveState();
  }

  recordModuleAttempt(moduleId: string, earnedXp: number) {
    this.modules.update((mods) =>
      mods.map((m) => (m.id === moduleId ? { ...m, attempts: m.attempts + 1 } : m))
    );

    const mod = this.modules().find((m) => m.id === moduleId);
    if (mod) {
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        title: `Práctica en ${mod.name}`,
        timeAgo: 'Justo ahora',
        xpText: earnedXp > 0 ? `${earnedXp} XP en sesión` : 'Repaso',
        icon: '🎯',
      };
      this.activities.update((list) => [newActivity, ...list.slice(0, 7)]);
    }

    this.saveState();
  }

  getModuleState(moduleId: string): 'completed' | 'current' | 'available' {
    const mods = this.modules();
    const index = mods.findIndex((m) => m.id === moduleId);
    if (index === -1) return 'available';
    if (mods[index].completed) return 'completed';
    const firstIncompleteIdx = mods.findIndex((m) => !m.completed);
    if (index === firstIncompleteIdx) return 'current';
    return 'available';
  }

  resetProgress() {
    this.modules.set(this.cloneInitialModules());
    this.activities.set(this.defaultActivities());
    this.baseXp.set(20);
    this.streakDays.set(1);
    this.lastActiveDate = this.todayIso();
    this.saveState();
  }
}
