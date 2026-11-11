import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../services/progress.service';
import { HelpGlossary } from '../../shared/help-glossary/help-glossary';
import { GameBoard } from '../shared/game-board';
import { MODULO_1 } from './modulo-1.data';

@Component({
  selector: 'app-modulo-1',
  standalone: true,
  imports: [GameBoard, RouterLink, HelpGlossary],
  templateUrl: './modulo-1.html',
  styleUrl: './modulo-1.css',
})
export class Modulo1 {
  private progressService = inject(ProgressService);
  data = MODULO_1;
  started = signal(false);
  glossaryOpen = signal(false);

  onFinished(r: { xp: number; lives: number }) {
    this.progressService.recordModuleCompletion(this.data.id, r.xp, r.lives);
  }

  onAttempted(r: { xp: number }) {
    this.progressService.recordModuleAttempt(this.data.id, r.xp);
  }
}
