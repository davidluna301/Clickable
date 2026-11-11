import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../services/progress.service';
import { HelpGlossary } from '../../shared/help-glossary/help-glossary';
import { GameBoard } from '../shared/game-board';
import { MODULO_4 } from './modulo-4.data';

@Component({
  selector: 'app-modulo-4',
  standalone: true,
  imports: [GameBoard, RouterLink, HelpGlossary],
  templateUrl: './modulo-4.html',
  styleUrl: './modulo-4.css',
})
export class Modulo4 {
  private progressService = inject(ProgressService);
  data = MODULO_4;
  started = signal(false);
  glossaryOpen = signal(false);

  onFinished(r: { xp: number; lives: number }) {
    this.progressService.recordModuleCompletion(this.data.id, r.xp, r.lives);
  }

  onAttempted(r: { xp: number }) {
    this.progressService.recordModuleAttempt(this.data.id, r.xp);
  }
}
