import { Component, inject, signal } from '@angular/core';
import { ProgressService, SavedModuleCheckpoint } from '../../services/progress.service';
import { HelpGlossary } from '../../shared/help-glossary/help-glossary';
import { GameBoard, ModuleAttemptResult, ModuleCompletionResult } from '../shared/game-board';
import { ModuleIntro } from '../shared/module-intro/module-intro';
import { MODULO_5 } from './modulo-5.data';

@Component({
  selector: 'app-modulo-5',
  standalone: true,
  imports: [GameBoard, ModuleIntro, HelpGlossary],
  templateUrl: './modulo-5.html',
  styleUrl: './modulo-5.css',
})
export class Modulo5 {
  private progressService = inject(ProgressService);
  data = MODULO_5;
  started = signal(false);
  glossaryOpen = signal(false);
  activeCheckpoint = signal<SavedModuleCheckpoint | null>(
    this.progressService.getModuleCheckpoint(this.data.id)
  );

  startFresh() {
    this.progressService.clearModuleCheckpoint(this.data.id);
    this.activeCheckpoint.set(null);
    this.started.set(true);
  }

  resumeOrStart() {
    this.activeCheckpoint.set(this.progressService.getModuleCheckpoint(this.data.id));
    this.started.set(true);
  }

  onCheckpoint(cp: SavedModuleCheckpoint) {
    this.progressService.saveModuleCheckpoint(this.data.id, cp);
  }

  onRestart() {
    this.progressService.clearModuleCheckpoint(this.data.id);
    this.activeCheckpoint.set(null);
  }

  onFinished(r: ModuleCompletionResult) {
    this.progressService.recordModuleCompletion(this.data.id, r.xp, r.lives, r.threatsFound);
    this.activeCheckpoint.set(null);
  }

  onAttempted(r: ModuleAttemptResult) {
    this.progressService.recordModuleAttempt(this.data.id, r.xp, r.threatsFound);
  }
}
