import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProgressService } from '../services/progress.service';
import { HelpGlossary } from '../shared/help-glossary/help-glossary';

@Component({
  imports: [RouterLink, HelpGlossary],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  auth = inject(AuthService);
  progress = inject(ProgressService);
  private router = inject(Router);

  glossaryOpen = signal(false);
  confirmReset = signal(false);

  getModuleClass(moduleId: string): string {
    return this.progress.getModuleState(moduleId);
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  resetAllProgress() {
    this.progress.resetProgress();
    this.confirmReset.set(false);
  }
}
