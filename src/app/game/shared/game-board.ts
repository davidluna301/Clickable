import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavedModuleCheckpoint } from '../../services/progress.service';
import { GlossaryCategory } from '../../shared/glossary.data';
import { HelpGlossary } from '../../shared/help-glossary/help-glossary';
import { GameModule, Part, PartKind } from './game.models';

export interface FeedbackOverlay {
  kind: 'threat-caught' | 'safe-mistake' | 'missed-summary' | 'stage-clear';
  isPositive: boolean;
  celebration?: boolean;
  title: string;
  subtitle: string;
  category?: string;
  tappedText?: string;
  why: string;
  whatItMeans?: string;
  tip?: string;
  remainingCue?: string;
  foundParts?: Part[];
  missedParts?: Part[];
  glossaryCategory?: GlossaryCategory;
  glossaryTermId?: string;
  actionType: 'resume' | 'advance' | 'finish-lost';
}

export interface ModuleCompletionResult {
  xp: number;
  lives: number;
  threatsFound: number;
}

export interface ModuleAttemptResult {
  xp: number;
  threatsFound: number;
}

export interface EmailBrandMeta {
  folder: string;
  senderName: string;
  avatarText: string;
  avatarBg: string;
  avatarColor: string;
  time: string;
  headerTitle: string;
  headerSub: string;
  tone: 'bank' | 'uni' | 'promo' | 'neutral';
  footerText: string;
}

export interface NotifMeta {
  app: string;
  icon: string;
  time: string;
}

export type MobileAppTheme =
  | 'whatsapp'
  | 'sms'
  | 'call'
  | 'qr'
  | 'alerts'
  | 'browser'
  | 'permissions'
  | 'marketplace'
  | 'instagram'
  | 'social'
  | 'wifi'
  | 'ai'
  | 'teams'
  | 'authenticator';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [RouterLink, HelpGlossary],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoard implements OnInit {
  module = input.required<GameModule>();
  initialCheckpoint = input<SavedModuleCheckpoint | null>(null);

  finished = output<ModuleCompletionResult>();
  attempted = output<ModuleAttemptResult>();
  checkpointSaved = output<SavedModuleCheckpoint>();
  restarted = output<void>();

  readonly maxLives = 3;
  lives = signal(this.maxLives);
  xp = signal(0);
  index = signal(0);
  found = signal<string[]>([]);
  wrong = signal<string[]>([]);
  closed = signal(false);
  threatsFoundTotal = signal(0);
  mistakesCount = signal(0);
  status = signal<'playing' | 'won' | 'lost'>('playing');

  overlay = signal<FeedbackOverlay | null>(null);
  tipsOpen = signal(false);

  // Help / Glossary drawer state
  glossaryOpen = signal(false);
  glossaryCategory = signal<GlossaryCategory>('all');
  glossaryTermId = signal<string>('');

  scenario = computed(() => this.module().scenarios[this.index()]);
  hearts = computed(() => Array.from({ length: this.maxLives }, (_, i) => i < this.lives()));

  urlParts = computed(() => this.scenario().parts.filter((p) => p.kind === 'url'));
  senderParts = computed(() => this.scenario().parts.filter((p) => p.kind === 'sender'));
  subjectParts = computed(() => this.scenario().parts.filter((p) => p.kind === 'subject'));
  bodyParts = computed(() =>
    this.scenario().parts.filter((p) => p.kind !== 'url' && p.kind !== 'sender' && p.kind !== 'subject')
  );

  missing = computed(() =>
    this.scenario().parts.filter((p) => p.threat && !this.found().includes(p.id))
  );
  totalThreatsInScenario = computed(
    () => this.scenario().parts.filter((p) => p.threat).length
  );
  evaluatedCount = computed(() => this.found().length + this.wrong().length);
  progress = computed(() =>
    Math.round((this.index() / this.module().scenarios.length) * 100)
  );
  accuracyScore = computed(() =>
    Math.min(100, Math.round(55 + (this.lives() / this.maxLives) * 45))
  );

  emailBrand = computed<EmailBrandMeta>(() => {
    const id = this.scenario().id;
    if (id === 'banco-suspendido') {
      return {
        folder: 'Recibidos',
        senderName: 'Banco Seguridad',
        avatarText: 'BS',
        avatarBg: '#0f2744',
        avatarColor: '#6ee7b7',
        time: '09:14 a. m.',
        headerTitle: 'BANCO SEGURIDAD',
        headerSub: 'Notificaciones de Cuenta Digital',
        tone: 'bank',
        footerText: 'Banco Seguridad · Centro de Monitoreo · Mensaje automático',
      };
    }
    if (id === 'calendario-ucc') {
      return {
        folder: 'Académico',
        senderName: 'Bienestar Universitario',
        avatarText: 'BU',
        avatarBg: '#14532d',
        avatarColor: '#a7f3d0',
        time: '11:02 a. m.',
        headerTitle: 'BIENESTAR UNIVERSITARIO',
        headerSub: 'Comunicación Institucional · Periodo 2026',
        tone: 'uni',
        footerText: 'Universidad Cooperativa · Vicerrectoría de Bienestar · Campus Virtual',
      };
    }
    if (id === 'premio') {
      return {
        folder: 'Promociones',
        senderName: 'Club Beneficios Éxito',
        avatarText: 'EX',
        avatarBg: '#b45309',
        avatarColor: '#fef3c7',
        time: '02:45 p. m.',
        headerTitle: 'CLUB BENEFICIOS ÉXITO',
        headerSub: 'Fidelización · Campaña Clientes',
        tone: 'promo',
        footerText: 'Programa de Puntos y Bonos · Aviso promocional',
      };
    }
    return {
      folder: 'Recibidos',
      senderName: 'Servicio de Correo',
      avatarText: 'C',
      avatarBg: '#1e293b',
      avatarColor: '#e2e8f0',
      time: 'Hoy',
      headerTitle: 'MENSAJE RECIBIDO',
      headerSub: 'Bandeja principal',
      tone: 'neutral',
      footerText: 'Correo electrónico simulado para entrenamiento',
    };
  });

  ngOnInit() {
    const cp = this.initialCheckpoint();
    const maxIdx = Math.max(0, this.module().scenarios.length - 1);
    if (cp && cp.lives > 0 && cp.scenarioIndex >= 0 && cp.scenarioIndex <= maxIdx) {
      this.index.set(cp.scenarioIndex);
      this.xp.set(Math.max(0, cp.xp));
      this.lives.set(Math.min(this.maxLives, Math.max(1, cp.lives)));
      this.found.set([...cp.found]);
      this.wrong.set([...cp.wrong]);
      this.closed.set(Boolean(cp.closed));
      this.threatsFoundTotal.set(cp.threatsDetected || 0);
      this.mistakesCount.set(cp.mistakesCount || 0);
    }
  }

  private emitCheckpoint() {
    if (this.status() !== 'playing') return;
    this.checkpointSaved.emit({
      scenarioIndex: this.index(),
      xp: this.xp(),
      lives: this.lives(),
      found: this.found(),
      wrong: this.wrong(),
      closed: this.closed(),
      threatsDetected: this.threatsFoundTotal(),
      mistakesCount: this.mistakesCount(),
      updatedAt: new Date().toISOString(),
    });
  }

  kindLabel(kind: PartKind): string {
    const labels: Record<PartKind, string> = {
      sender: 'Remitente',
      subject: 'Asunto',
      text: 'Contenido',
      link: 'Enlace',
      button: 'Botón',
      url: 'Barra URL',
      file: 'Adjunto',
      app: 'Aplicación',
      permission: 'Permiso',
      qr: 'Código QR',
    };
    return labels[kind] || 'Elemento';
  }

  kindIcon(kind: PartKind): string {
    const icons: Record<PartKind, string> = {
      sender: 'person',
      subject: 'label',
      text: 'chat_bubble',
      link: 'link',
      button: 'smart_button',
      url: 'public',
      file: 'attach_file',
      app: 'apps',
      permission: 'shield',
      qr: 'qr_code_2',
    };
    return icons[kind] || 'info';
  }

  mobileAppTheme(): MobileAppTheme {
    const sc = this.scenario();
    const header = (sc.appHeader || '').toLowerCase();
    const frame = sc.frame;
    if (header.includes('instagram')) return 'instagram';
    if (header.includes('whatsapp')) return 'whatsapp';
    if (header.includes('llamada')) return 'call';
    if (header.includes('qr')) return 'qr';
    if (header.includes('notificaciones')) return 'alerts';
    if (header.includes('navegador')) return 'browser';
    if (header.includes('permisos')) return 'permissions';
    if (header.includes('marketplace')) return 'marketplace';
    if (frame === 'social' || header.includes('social') || header.includes('redes') || header.includes('directos')) return 'social';
    if (frame === 'wifi-prompt' || header.includes('wifi') || header.includes('conexión') || header.includes('inalámbricas') || header.includes('portal cautivo')) return 'wifi';
    if (frame === 'ai-assistant' || header.includes('ia') || header.includes('asistente') || header.includes('inteligencia') || header.includes('deepfake')) return 'ai';
    if (header.includes('teams') || header.includes('institucional')) return 'teams';
    if (frame === 'workspace' || header.includes('authenticator') || header.includes('2fa') || header.includes('mfa')) return 'authenticator';
    return 'sms';
  }

  splitButtonArrow(text: string): { label: string; target: string | null } {
    const idx = text.indexOf(' → ');
    if (idx === -1) return { label: text, target: null };
    return {
      label: text.slice(0, idx).trim(),
      target: text.slice(idx + 3).trim(),
    };
  }

  attachmentBadge(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.exe')) return 'EXE';
    if (lower.endsWith('.apk')) return 'APK';
    if (lower.endsWith('.pdf')) return 'PDF';
    return 'FILE';
  }

  notifMeta(partId: string): NotifMeta {
    const map: Record<string, NotifMeta> = {
      nosignal: { app: 'Red Móvil', icon: 'signal_cellular_off', time: 'hace 2 h' },
      bankpass: { app: 'Correo · Banco', icon: 'mail', time: 'hace 18 m' },
      battery: { app: 'Sistema', icon: 'battery_5_bar', time: 'ahora' },
      wifi: { app: 'Conectividad', icon: 'wifi', time: 'activo' },
    };
    return map[partId] || { app: 'Sistema', icon: 'notifications', time: 'ahora' };
  }

  pick(p: Part) {
    if (this.closed() || this.status() !== 'playing' || this.overlay()) return;
    if (this.found().includes(p.id) || this.wrong().includes(p.id)) return;

    if (p.threat) {
      this.found.update((f) => [...f, p.id]);
      this.threatsFoundTotal.update((c) => c + 1);

      const caughtAllThreats =
        this.totalThreatsInScenario() > 0 && this.missing().length === 0;

      if (caughtAllThreats) {
        this.closed.set(true);
        this.xp.update((x) => x + 30);
        this.emitCheckpoint();

        const caughtList = this.scenario().parts.filter((item) =>
          this.found().includes(item.id)
        );
        const total = caughtList.length;

        this.overlay.set({
          kind: 'stage-clear',
          isPositive: true,
          celebration: true,
          title: '¡Sorpresa! ¡Ganaste este reto!',
          subtitle:
            total === 1
              ? 'Encontraste la señal sospechosa oculta (+30 XP en total)'
              : `Encontraste todas las partes sospechosas (${total}/${total}) · +30 XP`,
          category: p.category || 'Amenazas neutralizadas',
          tappedText: p.text,
          why: p.why,
          whatItMeans: p.whatItMeans,
          tip: p.tip,
          foundParts: caughtList,
          glossaryCategory: p.glossaryCategory || this.module().glossaryCategory || 'all',
          glossaryTermId: p.glossaryTermId || '',
          actionType: 'advance',
        });
        return;
      }

      this.xp.update((x) => x + 10);
      this.emitCheckpoint();

      const caughtSoFar = this.found().length;
      this.overlay.set({
        kind: 'threat-caught',
        isPositive: true,
        title: '¡Bien detectado!',
        subtitle: 'Identificaste una señal sospechosa real (+10 XP)',
        category: p.category || 'Señal de riesgo',
        tappedText: p.text,
        why: p.why,
        whatItMeans: p.whatItMeans,
        tip: p.tip,
        remainingCue:
          caughtSoFar === 1
            ? 'Vas muy bien: sigue inspeccionando el resto del escenario.'
            : `Llevas ${caughtSoFar} señales detectadas: revisa si queda alguna más.`,
        glossaryCategory: p.glossaryCategory || this.module().glossaryCategory || 'all',
        glossaryTermId: p.glossaryTermId || '',
        actionType: 'resume',
      });
    } else {
      this.wrong.update((w) => [...w, p.id]);
      this.lives.update((l) => Math.max(0, l - 1));
      this.mistakesCount.update((m) => m + 1);
      const noLives = this.lives() <= 0;

      if (!noLives) {
        this.emitCheckpoint();
      }

      this.overlay.set({
        kind: 'safe-mistake',
        isPositive: false,
        title: 'Elemento seguro (-1 vida)',
        subtitle: 'Marcaste algo normal o legítimo como si fuera un ataque',
        category: p.category || 'Elemento seguro',
        tappedText: p.text,
        why: p.why,
        whatItMeans: p.whatItMeans,
        tip: p.tip,
        glossaryCategory: p.glossaryCategory || this.module().glossaryCategory || 'all',
        glossaryTermId: p.glossaryTermId || '',
        actionType: noLives ? 'finish-lost' : 'resume',
      });
    }
  }

  check() {
    if (this.closed() || this.status() !== 'playing' || this.overlay()) return;
    this.closed.set(true);

    const missed = this.missing();
    if (missed.length > 0) {
      this.lives.update((l) => Math.max(0, l - 1));
      this.mistakesCount.update((m) => m + 1);
      const noLives = this.lives() <= 0;

      if (!noLives) {
        this.emitCheckpoint();
      }

      this.overlay.set({
        kind: 'missed-summary',
        isPositive: false,
        title: `Se te ${missed.length === 1 ? 'escapó 1 señal' : `escaparon ${missed.length} señales`}`,
        subtitle: 'Debes revisar todo con calma antes de confirmar (-1 vida)',
        why: 'En una situación real, dejar pasar cualquiera de estas señales puede comprometer tus claves o tu dinero.',
        missedParts: missed,
        actionType: noLives ? 'finish-lost' : 'advance',
      });
    } else {
      this.xp.update((x) => x + 20);
      this.emitCheckpoint();
      const isLegitSite = this.totalThreatsInScenario() === 0;
      this.overlay.set({
        kind: 'stage-clear',
        isPositive: true,
        celebration: true,
        title: isLegitSite ? '¡Sitio legítimo confirmado!' : '¡Escenario superado!',
        subtitle: isLegitSite
          ? 'Validaste correctamente que era un portal seguro (+20 XP)'
          : 'Detectaste todas las trampas de este escenario (+20 XP extra)',
        why: isLegitSite
          ? 'Saber distinguir un portal oficial auténtico es tan valioso como frenar un ataque de phishing.'
          : 'Analizaste remitente, contenido y acciones antes de confiar. Así se previene un clic peligroso.',
        actionType: 'advance',
      });
    }
  }

  handleOverlayAction() {
    const current = this.overlay();
    if (!current) return;

    this.overlay.set(null);

    if (current.actionType === 'finish-lost') {
      this.status.set('lost');
      this.attempted.emit({
        xp: this.xp(),
        threatsFound: this.threatsFoundTotal(),
      });
      return;
    }

    if (current.actionType === 'advance') {
      this.next();
    }
  }

  next() {
    if (this.index() + 1 >= this.module().scenarios.length) {
      this.status.set('won');
      this.finished.emit({
        xp: this.xp(),
        lives: this.lives(),
        threatsFound: this.threatsFoundTotal(),
      });
      return;
    }
    this.index.update((i) => i + 1);
    this.found.set([]);
    this.wrong.set([]);
    this.closed.set(false);
    this.overlay.set(null);
    this.emitCheckpoint();
  }

  retry() {
    this.lives.set(this.maxLives);
    this.xp.set(0);
    this.index.set(0);
    this.found.set([]);
    this.wrong.set([]);
    this.closed.set(false);
    this.threatsFoundTotal.set(0);
    this.mistakesCount.set(0);
    this.overlay.set(null);
    this.status.set('playing');
    this.restarted.emit();
  }

  state(p: Part): string {
    if (this.found().includes(p.id)) return 'found';
    if (this.wrong().includes(p.id)) return 'wrong';
    if (this.closed() && p.threat) return 'missed';
    return '';
  }

  openHelp(category?: GlossaryCategory, termId = '') {
    this.glossaryCategory.set(category || this.module().glossaryCategory || 'all');
    this.glossaryTermId.set(termId);
    this.glossaryOpen.set(true);
  }
}
