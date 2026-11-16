import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SavedModuleCheckpoint } from '../../../services/progress.service';
import { Frame, GameModule } from '../game.models';

@Component({
  selector: 'app-module-intro',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './module-intro.html',
  styleUrl: './module-intro.css',
})
export class ModuleIntro {
  module = input.required<GameModule>();
  orderLabel = input.required<string>();
  categoryLabel = input.required<string>();
  glossaryLabel = input.required<string>();
  checkpoint = input<SavedModuleCheckpoint | null>(null);

  start = output<void>();
  startFresh = output<void>();
  openGlossary = output<void>();

  hasCheckpoint = computed(() => this.checkpoint() !== null);

  frameIcon(frame: Frame): string {
    const map: Record<Frame, string> = {
      email: 'mail',
      browser: 'language',
      sms: 'smartphone',
      payment: 'account_balance_wallet',
      social: 'share',
      'wifi-prompt': 'wifi',
      'ai-assistant': 'psychology',
      workspace: 'apartment',
    };
    return map[frame] || 'shield';
  }
}
