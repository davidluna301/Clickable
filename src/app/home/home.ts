import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GlossaryCategory } from '../shared/glossary.data';
import { HelpGlossary } from '../shared/help-glossary/help-glossary';

interface HomeDemoSignal {
  id: string;
  label: string;
  reason: string;
}

@Component({
  imports: [RouterLink, HelpGlossary],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  auth = inject(AuthService);

  scrolled = signal(false);
  glossaryOpen = signal(false);
  glossaryCategory = signal<GlossaryCategory>('all');
  glossaryTerm = signal<string>('');

  // Interactive mini-simulation in #juego
  activeDemoSignal = signal<HomeDemoSignal | null>(null);
  inspectedSignals = signal<string[]>([]);

  readonly demoSignals: Record<string, HomeDemoSignal> = {
    sender: {
      id: 'sender',
      label: 'soporte@banco-seguro.co',
      reason:
        'Señal 1 · Dominio falso (Phishing): El correo imita el nombre "Banco Nacional", pero usa un dominio genérico inventado (banco-seguro.co). Un banco real siempre escribe desde su dominio oficial.',
    },
    urgency: {
      id: 'urgency',
      label: 'Confirma tu identidad ahora para evitar bloqueo',
      reason:
        'Señal 2 · Urgencia artificial: Los atacantes generan miedo al bloqueo inmediato para que actúes rápido sin verificar en tu app oficial.',
    },
    button: {
      id: 'button',
      label: 'Botón "Confirmar identidad →"',
      reason:
        'Señal 3 · Enlace trampa: Este botón te llevaría a una web clonada diseñada para capturar tu usuario, contraseña y códigos dinámicos.',
    },
  };

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openGlossary(category: GlossaryCategory = 'all', termId = '') {
    this.glossaryCategory.set(category);
    this.glossaryTerm.set(termId);
    this.glossaryOpen.set(true);
  }

  inspectDemo(key: 'sender' | 'urgency' | 'button') {
    const sig = this.demoSignals[key];
    this.activeDemoSignal.set(sig);
    if (!this.inspectedSignals().includes(key)) {
      this.inspectedSignals.update((list) => [...list, key]);
    }
  }
}
