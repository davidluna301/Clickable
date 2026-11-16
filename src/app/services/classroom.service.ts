import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProgressService } from './progress.service';

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  avatarText: string;
  completedModules: number;
  totalModules: number;
  progressPct: number;
  accuracyPct: number;
  xp: number;
  mostFailedModule: string;
  mistakesCount: number;
  status: 'destacado' | 'al-dia' | 'en-riesgo';
  lastActive: string;
}

export interface Classroom {
  code: string;
  name: string;
  subject: string;
  institution: string;
  teacherName: string;
  teacherEmail: string;
  createdAt: string;
  students: StudentRecord[];
}

export interface ClassStats {
  totalStudents: number;
  averageProgress: number;
  averageAccuracy: number;
  mostCriticalModule: string;
  totalMistakesAnalyzed: number;
}

const CLASSROOM_STORAGE_KEY = 'clickable_classrooms_v1';
const USER_CLASS_CODE_KEY = 'clickable_joined_class_code_v1';

@Injectable({
  providedIn: 'root',
})
export class ClassroomService {
  private auth = inject(AuthService);
  private progress = inject(ProgressService);

  private readonly initialClassrooms: Classroom[] = [
    {
      code: 'ELECTIVA-6A-UCC',
      name: 'Grupo 6A - Ingeniería de Sistemas',
      subject: 'Electiva de Seguridad Informática',
      institution: 'Universidad Cooperativa de Colombia (UCC)',
      teacherName: 'Prof. Ivonne Barco',
      teacherEmail: 'ivonne.barco@campusucc.edu.co',
      createdAt: '2026-10-15',
      students: [
        {
          id: 'val-01',
          name: 'Valentina Burbano',
          email: 'valentina.burbanos@campusucc.edu.co',
          avatarText: 'VB',
          completedModules: 8,
          totalModules: 8,
          progressPct: 100,
          accuracyPct: 95,
          xp: 860,
          mostFailedModule: 'Módulo 2 (Navegación)',
          mistakesCount: 2,
          status: 'destacado',
          lastActive: 'Hoy, 09:20 AM',
        },
        {
          id: 'dav-02',
          name: 'David Luna',
          email: 'david.lunamar@campusucc.edu.co',
          avatarText: 'DL',
          completedModules: 7,
          totalModules: 8,
          progressPct: 88,
          accuracyPct: 89,
          xp: 760,
          mostFailedModule: 'Módulo 3 (Celular & SMS)',
          mistakesCount: 3,
          status: 'destacado',
          lastActive: 'Hoy, 08:45 AM',
        },
        {
          id: 'san-03',
          name: 'Santiago Urbina',
          email: 'santiagourbina2509@gmail.com',
          avatarText: 'SU',
          completedModules: 7,
          totalModules: 8,
          progressPct: 88,
          accuracyPct: 86,
          xp: 730,
          mostFailedModule: 'Módulo 6 (Wi-Fi Público)',
          mistakesCount: 4,
          status: 'al-dia',
          lastActive: 'Ayer, 04:12 PM',
        },
        {
          id: 'cam-04',
          name: 'Camila Restrepo',
          email: 'camila.restrepo@campusucc.edu.co',
          avatarText: 'CR',
          completedModules: 5,
          totalModules: 8,
          progressPct: 62,
          accuracyPct: 78,
          xp: 510,
          mostFailedModule: 'Módulo 1 (Phishing)',
          mistakesCount: 7,
          status: 'al-dia',
          lastActive: 'Hace 2 días',
        },
        {
          id: 'mat-05',
          name: 'Mateo Gómez',
          email: 'mateo.gomez@campusucc.edu.co',
          avatarText: 'MG',
          completedModules: 3,
          totalModules: 8,
          progressPct: 38,
          accuracyPct: 63,
          xp: 310,
          mostFailedModule: 'Módulo 2 (Navegación)',
          mistakesCount: 9,
          status: 'en-riesgo',
          lastActive: 'Hace 4 días',
        },
        {
          id: 'and-06',
          name: 'Andrés Felipe Morales',
          email: 'andres.morales@campusucc.edu.co',
          avatarText: 'AM',
          completedModules: 2,
          totalModules: 8,
          progressPct: 25,
          accuracyPct: 56,
          xp: 190,
          mostFailedModule: 'Módulo 2 (Navegación)',
          mistakesCount: 11,
          status: 'en-riesgo',
          lastActive: 'Hace 5 días',
        },
      ],
    },
  ];

  classrooms = signal<Classroom[]>(this.loadClassrooms());
  activeClassCode = signal<string>('ELECTIVA-6A-UCC');
  joinedClassCode = signal<string>(this.loadJoinedCode());

  activeClassroom = computed<Classroom | null>(() => {
    const list = this.classrooms();
    const code = this.activeClassCode();
    return list.find((c) => c.code === code) || list[0] || null;
  });

  classStats = computed<ClassStats>(() => {
    const room = this.activeClassroom();
    if (!room || room.students.length === 0) {
      return {
        totalStudents: 0,
        averageProgress: 0,
        averageAccuracy: 0,
        mostCriticalModule: 'Sin datos',
        totalMistakesAnalyzed: 0,
      };
    }

    const total = room.students.length;
    const avgProg = Math.round(
      room.students.reduce((acc, s) => acc + s.progressPct, 0) / total
    );
    const avgAcc = Math.round(
      room.students.reduce((acc, s) => acc + s.accuracyPct, 0) / total
    );
    const totalMistakes = room.students.reduce((acc, s) => acc + s.mistakesCount, 0);

    // Contar el módulo más fallado
    const mistakeCounts: Record<string, number> = {};
    for (const s of room.students) {
      if (s.mostFailedModule) {
        mistakeCounts[s.mostFailedModule] =
          (mistakeCounts[s.mostFailedModule] || 0) + (s.mistakesCount || 1);
      }
    }

    let topMod = 'Módulo 2 (Navegación)';
    let maxMistakes = 0;
    for (const [mod, count] of Object.entries(mistakeCounts)) {
      if (count > maxMistakes) {
        maxMistakes = count;
        topMod = mod;
      }
    }

    return {
      totalStudents: total,
      averageProgress: avgProg,
      averageAccuracy: avgAcc,
      mostCriticalModule: `${topMod} (${maxMistakes} fallos)`,
      totalMistakesAnalyzed: totalMistakes,
    };
  });

  private loadClassrooms(): Classroom[] {
    try {
      const saved = localStorage.getItem(CLASSROOM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return this.initialClassrooms;
  }

  private loadJoinedCode(): string {
    try {
      return localStorage.getItem(USER_CLASS_CODE_KEY) || 'ELECTIVA-6A-UCC';
    } catch {
      return 'ELECTIVA-6A-UCC';
    }
  }

  private saveClassrooms(list: Classroom[]) {
    this.classrooms.set(list);
    try {
      localStorage.setItem(CLASSROOM_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  createClassroom(name: string, subject: string, teacherName: string): string {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `UCC-${subject.slice(0, 3).toUpperCase()}-${randomSuffix}`;
    const newRoom: Classroom = {
      code,
      name: name.trim() || 'Aula de Ciberseguridad',
      subject: subject.trim() || 'Seguridad Informática',
      institution: 'Universidad Cooperativa de Colombia (UCC)',
      teacherName: teacherName.trim() || 'Docente Responsable',
      teacherEmail: this.auth.currentUser()?.email || 'docente@campusucc.edu.co',
      createdAt: new Date().toISOString().slice(0, 10),
      students: [],
    };

    const updated = [newRoom, ...this.classrooms()];
    this.saveClassrooms(updated);
    this.activeClassCode.set(code);
    return code;
  }

  joinClassroom(codeToJoin: string): { success: boolean; message: string } {
    const cleanCode = codeToJoin.trim().toUpperCase();
    const room = this.classrooms().find((c) => c.code.toUpperCase() === cleanCode);

    if (!room) {
      return { success: false, message: 'Código de clase no encontrado. Verifica e intenta de nuevo.' };
    }

    const user = this.auth.currentUser();
    const stats = this.progress.stats();
    const mods = this.progress.modules();
    const completedMods = mods.filter((m) => m.completed);

    const studentRecord: StudentRecord = {
      id: user?.uid || `guest-${Date.now()}`,
      name: user?.displayName || user?.firstName || 'Estudiante Conectado',
      email: user?.email || 'estudiante@campusucc.edu.co',
      avatarText: this.auth.userInitials(),
      completedModules: stats.modulesCompleted,
      totalModules: stats.totalModules,
      progressPct: Math.round((stats.modulesCompleted / Math.max(1, stats.totalModules)) * 100),
      accuracyPct: stats.averageAccuracy || 85,
      xp: stats.xp,
      mostFailedModule: 'Módulo 2 (Navegación)',
      mistakesCount: Math.max(1, 10 - completedMods.length),
      status: stats.averageAccuracy >= 85 ? 'destacado' : stats.averageAccuracy >= 70 ? 'al-dia' : 'en-riesgo',
      lastActive: 'Justo ahora',
    };

    // Agregar o actualizar estudiante en el aula
    const existingIndex = room.students.findIndex(
      (s) => s.email.toLowerCase() === studentRecord.email.toLowerCase()
    );

    let updatedStudents = [...room.students];
    if (existingIndex >= 0) {
      updatedStudents[existingIndex] = studentRecord;
    } else {
      updatedStudents.push(studentRecord);
    }

    const updatedRooms = this.classrooms().map((c) =>
      c.code === room.code ? { ...c, students: updatedStudents } : c
    );

    this.saveClassrooms(updatedRooms);
    this.joinedClassCode.set(cleanCode);
    this.activeClassCode.set(cleanCode);

    try {
      localStorage.setItem(USER_CLASS_CODE_KEY, cleanCode);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `¡Te has unido exitosamente al aula "${room.name}" (${room.code})!`,
    };
  }

  selectClassroom(code: string) {
    this.activeClassCode.set(code);
  }
}
