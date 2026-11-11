import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../services/progress.service';
import { HelpGlossary } from '../../shared/help-glossary/help-glossary';
import { GameBoard } from '../shared/game-board';
import { MODULO_2 } from './modulo-2.data';

@Component({
  selector: 'app-modulo-2',
  standalone: true,
  imports: [GameBoard, RouterLink, HelpGlossary],
  templateUrl: './modulo-2.html',
  styleUrl: './modulo-2.css',
})
export class Modulo2 {
  private progressService = inject(ProgressService);
  data = MODULO_2;
  started = signal(false);
  glossaryOpen = signal(false);

  onFinished(r: { xp: number; lives: number }) {
    this.progressService.recordModuleCompletion(this.data.id, r.xp, r.lives);
  }

  onAttempted(r: { xp: number }) {
    this.progressService.recordModuleAttempt(this.data.id, r.xp);
  }
}
