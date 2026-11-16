import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ClassroomService, StudentRecord } from '../services/classroom.service';
import { ProgressService } from '../services/progress.service';
import { PublicNav } from '../shared/public-nav/public-nav';

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [RouterLink, FormsModule, PublicNav],
  templateUrl: './classroom.html',
  styleUrl: './classroom.css',
})
export class ClassroomComponent {
  auth = inject(AuthService);
  classroomService = inject(ClassroomService);
  progressService = inject(ProgressService);

  // Tab: 'dashboard' (vista docente) | 'join' (unirse como estudiante)
  activeTab = signal<'dashboard' | 'join'>('dashboard');

  // Filters for students table
  filterStatus = signal<'todos' | 'destacado' | 'al-dia' | 'en-riesgo'>('todos');
  searchQuery = signal<string>('');

  // Form for creating classroom
  showCreateModal = signal<boolean>(false);
  newClassName = signal<string>('');
  newClassSubject = signal<string>('Seguridad Informática');
  newTeacherName = signal<string>('Prof. Ivonne Barco');

  // Form for joining classroom
  inputJoinCode = signal<string>('');
  joinMessage = signal<{ success: boolean; text: string } | null>(null);
  copiedCode = signal<boolean>(false);

  filteredStudents = computed<StudentRecord[]>(() => {
    const room = this.classroomService.activeClassroom();
    if (!room) return [];

    const query = this.searchQuery().toLowerCase().trim();
    const status = this.filterStatus();

    return room.students.filter((s) => {
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.mostFailedModule.toLowerCase().includes(query);

      const matchesStatus = status === 'todos' || s.status === status;

      return matchesQuery && matchesStatus;
    });
  });

  copyCode(code: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      this.copiedCode.set(true);
      setTimeout(() => this.copiedCode.set(false), 2500);
    }
  }

  submitCreateClassroom() {
    if (!this.newClassName().trim()) return;

    this.classroomService.createClassroom(
      this.newClassName(),
      this.newClassSubject(),
      this.newTeacherName()
    );

    this.newClassName.set('');
    this.showCreateModal.set(false);
  }

  submitJoinClassroom() {
    if (!this.inputJoinCode().trim()) return;

    const res = this.classroomService.joinClassroom(this.inputJoinCode());
    this.joinMessage.set({
      success: res.success,
      text: res.message,
    });

    if (res.success) {
      setTimeout(() => {
        this.activeTab.set('dashboard');
      }, 1200);
    }
  }
}
