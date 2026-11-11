import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GlossaryCategory } from '../../shared/glossary.data';
import { HelpGlossary } from '../../shared/help-glossary/help-glossary';
import { GameModule, Part, PartKind } from './game.models';

export interface FeedbackOverlay {
  kind: 'threat-caught' | 'safe-mistake' | 'missed-summary' | 'stage-clear';
  isPositive: boolean;
  title: string;
  subtitle: string;
  category?: string;
  tappedText?: string;
  why: string;
  whatItMeans?: string;
  tip?: string;
  missedParts?: Part[];
  glossaryCategory?: GlossaryCategory;
  glossaryTermId?: string;
  actionType: 'resume' | 'advance' | 'finish-lost';
}

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [RouterLink, HelpGlossary],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoard {
  module = input.required<GameModule>();
  finished = output<{ xp: number; lives: number }>();
  attempted = output<{ xp: number }>();

  readonly maxLives = 3;
  lives = signal(this.maxLives);
  xp = signal(0);
  index = signal(0);
  found = signal<string[]>([]);
  wrong = signal<string[]>([]);
  closed = signal(false);
  status = signal<'playing' | 'won' | 'lost'>('playing');

  // Layout mixto: en desktop por defecto tarjetas interactivas, con opción de alternar a simulador móvil
  desktopViewMode = signal<'cards' | 'simulator'>('cards');
  overlay = signal<FeedbackOverlay | null>(null);

  // Help / Glossary drawer state
  glossaryOpen = signal(false);
  glossaryCategory = signal<GlossaryCategory>('all');
  glossaryTermId = signal<string>('');

  scenario = computed(() => this.module().scenarios[this.index()]);
  hearts = computed(() => Array.from({ length: this.maxLives }, (_, i) => i < this.lives()));
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

  kindLabel(kind: PartKind): string {
    const labels: Record<PartKind, string> = {
      sender: '👤 Remitente',
      subject: '🏷️ Asunto',
      text: '💬 Mensaje',
      link: '🔗 Enlace',
      button: '🔘 Botón de acción',
      url: '🌐 Dirección URL',
      file: '📎 Archivo adjunto',
      app: '📲 Aplicación',
      permission: '🔐 Permiso solicitado',
      qr: '▦ Código QR',
    };
    return labels[kind] || 'Elemento';
  }

  pick(p: Part) {
    if (this.closed() || this.status() !== 'playing' || this.overlay()) return;
    if (this.found().includes(p.id) || this.wrong().includes(p.id)) return;

    if (p.threat) {
      this.found.update((f) => [...f, p.id]);
      this.xp.update((x) => x + 10);
      this.overlay.set({
        kind: 'threat-caught',
        isPositive: true,
        title: '¡Correcto!',
        subtitle: 'Identificaste una señal peligrosa (+10 XP)',
        category: p.category || 'Señal de riesgo',
        tappedText: p.text,
        why: p.why,
        whatItMeans: p.whatItMeans,
        tip: p.tip,
        glossaryCategory: p.glossaryCategory || this.module().glossaryCategory || 'all',
        glossaryTermId: p.glossaryTermId || '',
        actionType: 'resume',
      });
    } else {
      this.wrong.update((w) => [...w, p.id]);
      this.lives.update((l) => Math.max(0, l - 1));
      const noLives = this.lives() <= 0;

      this.overlay.set({
        kind: 'safe-mistake',
        isPositive: false,
        title: '¡Ten cuidado!',
        subtitle: 'Este elemento en realidad es seguro (no era una amenaza)',
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
      const noLives = this.lives() <= 0;
      this.overlay.set({
        kind: 'missed-summary',
        isPositive: false,
        title: `Se te ${missed.length === 1 ? 'escapó 1 señal' : `escaparon ${missed.length} señales`}`,
        subtitle: 'Revisa las señales de peligro que faltaron antes de continuar (-1 vida)',
        why: 'En una situación real, pasar por alto alguna de estas señales puede exponerte a phishing o robo de datos.',
        missedParts: missed,
        actionType: noLives ? 'finish-lost' : 'advance',
      });
    } else {
      this.xp.update((x) => x + 20);
      const isLegitSite = this.totalThreatsInScenario() === 0;
      this.overlay.set({
        kind: 'stage-clear',
        isPositive: true,
        title: isLegitSite ? '¡Sitio legítimo confirmado!' : '¡Escenario superado!',
        subtitle: isLegitSite
          ? 'Confirmaste con criterio que no había amenazas (+20 XP)'
          : 'Encontraste todas las señales sospechosas (+20 XP extra)',
        why: isLegitSite
          ? 'Saber cuándo un portal oficial es legítimo es tan importante como detectar estafas.'
          : 'Examinaste con calma cada parte del escenario sin dejarte engañar.',
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
      this.attempted.emit({ xp: this.xp() });
      return;
    }

    if (current.actionType === 'advance') {
      this.next();
    }
  }

  next() {
    if (this.index() + 1 >= this.module().scenarios.length) {
      this.status.set('won');
      this.finished.emit({ xp: this.xp(), lives: this.lives() });
      return;
    }
    this.index.update((i) => i + 1);
    this.found.set([]);
    this.wrong.set([]);
    this.closed.set(false);
    this.overlay.set(null);
  }

  retry() {
    this.lives.set(this.maxLives);
    this.xp.set(0);
    this.index.set(0);
    this.found.set([]);
    this.wrong.set([]);
    this.closed.set(false);
    this.overlay.set(null);
    this.status.set('playing');
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
