import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ClassroomService, StudentRecord } from '../services/classroom.service';
import { ProgressService } from '../services/progress.service';
import { ClassroomComponent } from './classroom';

describe('ClassroomComponent', () => {
  let fixture: ComponentFixture<ClassroomComponent>;
  let component: ClassroomComponent;

  const mockStudents: StudentRecord[] = [
    {
      id: 's1',
      name: 'Valentina Burbano Salazar',
      email: 'valentina.burbanos@campusucc.edu.co',
      avatarText: 'VB',
      progressPct: 100,
      completedModules: 8,
      totalModules: 8,
      accuracyPct: 91,
      xp: 1310,
      mistakesCount: 2,
      status: 'destacado',
      mostFailedModule: 'Módulo 2 (Clonación)',
      lastActive: 'Hace 5 min',
    },
    {
      id: 's2',
      name: 'David Luna',
      email: 'david.lunamar@campusucc.edu.co',
      avatarText: 'DL',
      progressPct: 85,
      completedModules: 7,
      totalModules: 8,
      accuracyPct: 84,
      xp: 1050,
      mistakesCount: 5,
      status: 'al-dia',
      mostFailedModule: 'Módulo 4 (QR Malicioso)',
      lastActive: 'Hace 1 hora',
    },
  ];

  const classroomStub = {
    activeClassroom: signal({
      code: 'ELECTIVA-6A-UCC',
      name: 'Grupo 6A - Ingeniería de Sistemas',
      subject: 'Electiva de Seguridad Informática',
      teacherName: 'Prof. Ivonne Barco',
      institution: 'Universidad Cooperativa de Colombia (UCC)',
      students: mockStudents,
    }),
    classrooms: signal([]),
    activeClassCode: signal('ELECTIVA-6A-UCC'),
    classStats: signal({
      totalStudents: 2,
      averageProgress: 93,
      averageAccuracy: 88,
      mostCriticalModule: 'Módulo 2 (Clonación)',
    }),
    selectClassroom: () => undefined,
    createClassroom: () => undefined,
    joinClassroom: () => ({ success: true, message: 'Vinculado' }),
  };

  const authStub = {
    currentUser: signal(null).asReadonly(),
    isAuthenticated: () => true,
    userInitials: () => 'UCC',
  };

  const progressStub = {
    modules: signal([]).asReadonly(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomComponent],
      providers: [
        provideRouter([]),
        { provide: ClassroomService, useValue: classroomStub },
        { provide: AuthService, useValue: authStub },
        { provide: ProgressService, useValue: progressStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe inicializarse con el código de clase y panel de estudiantes', () => {
    expect(component).toBeTruthy();
    expect(component.classroomService.activeClassroom()?.code).toBe('ELECTIVA-6A-UCC');
    expect(component.filteredStudents().length).toBe(2);
  });

  it('debe filtrar estudiantes por estado', () => {
    component.filterStatus.set('destacado');
    expect(component.filteredStudents().length).toBe(1);
    expect(component.filteredStudents()[0].name).toContain('Valentina');
  });
});
