import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModuleProgress, ProgressService } from '../services/progress.service';
import { HelpGlossary } from '../shared/help-glossary/help-glossary';

@Component({
  imports: [RouterLink, HelpGlossary],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  auth = inject(AuthService);
  progress = inject(ProgressService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  glossaryOpen = signal(false);
  confirmReset = signal(false);
  showAllActivity = signal(false);
  lockedAlert = signal<{ moduleName: string; requiredOrder: number } | null>(null);
  lockedShakeId = signal<string | null>(null);
  showCertificateModal = signal(false);

  todayFormatted = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  stats = this.progress.stats;

  inProgressModule = computed(() =>
    this.progress.modules().find((m) => !m.completed && m.unlocked && m.checkpoint !== null) || null
  );

  recentActivities = computed(() => {
    const all = this.progress.activities();
    return this.showAllActivity() ? all : all.slice(0, 4);
  });

  ngOnInit() {
    const lockedId = this.route.snapshot.queryParamMap.get('locked');
    if (lockedId) {
      const target = this.progress.modules().find((m) => m.id === lockedId);
      if (target && !target.unlocked) {
        this.lockedAlert.set({
          moduleName: `${target.order}. ${target.name}`,
          requiredOrder: Math.max(1, target.order - 1),
        });
      }
      this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
    }
  }

  getModuleClass(moduleId: string) {
    return this.progress.getModuleState(moduleId);
  }

  checkpointScenarioHuman(m: ModuleProgress): number {
    if (!m.checkpoint) return 1;
    return Math.min(m.totalScenarios, m.checkpoint.scenarioIndex + 1);
  }

  checkpointPct(m: ModuleProgress): number {
    if (!m.checkpoint || !m.totalScenarios) return 0;
    const doneSteps = m.checkpoint.scenarioIndex + (m.checkpoint.closed ? 1 : 0.35);
    return Math.min(95, Math.max(10, Math.round((doneSteps / m.totalScenarios) * 100)));
  }

  notifyLocked(m: ModuleProgress) {
    this.lockedAlert.set({
      moduleName: `${m.order}. ${m.name}`,
      requiredOrder: Math.max(1, m.order - 1),
    });
    this.lockedShakeId.set(m.id);
    setTimeout(() => {
      if (this.lockedShakeId() === m.id) {
        this.lockedShakeId.set(null);
      }
    }, 650);
  }

  dismissLockedAlert() {
    this.lockedAlert.set(null);
  }

  discardCheckpoint(event: Event, moduleId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.progress.clearModuleCheckpoint(moduleId);
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  printCertificate() {
    window.print();
  }

  resetAllProgress() {
    this.progress.resetProgress();
    this.confirmReset.set(false);
    this.lockedAlert.set(null);
  }
}
