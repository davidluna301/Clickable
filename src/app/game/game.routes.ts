// game/game.routes.ts
import { Routes } from '@angular/router';
import { moduleUnlockGuard } from '../guards/auth.guard';

export const GAME_ROUTES: Routes = [
  { path: '', redirectTo: 'modulo-1', pathMatch: 'full' },
  {
    path: 'modulo-1',
    loadComponent: () => import('./modulo-1/modulo-1').then((m) => m.Modulo1),
  },
  {
    path: 'modulo-2',
    canActivate: [moduleUnlockGuard],
    data: { moduleId: 'navegacion' },
    loadComponent: () => import('./modulo-2/modulo-2').then((m) => m.Modulo2),
  },
  {
    path: 'modulo-3',
    canActivate: [moduleUnlockGuard],
    data: { moduleId: 'celular' },
    loadComponent: () => import('./modulo-3/modulo-3').then((m) => m.Modulo3),
  },
  {
    path: 'modulo-4',
    canActivate: [moduleUnlockGuard],
    data: { moduleId: 'fraudes' },
    loadComponent: () => import('./modulo-4/modulo-4').then((m) => m.Modulo4),
  },
  {
    path: 'modulo-5',
    canActivate: [moduleUnlockGuard],
    data: { moduleId: 'redes-sociales' },
    loadComponent: () => import('./modulo-5/modulo-5').then((m) => m.Modulo5),
  },
  {
    path: 'modulo-6',
    canActivate: [moduleUnlockGuard],
    data: { moduleId: 'wifi' },
    loadComponent: () => import('./modulo-6/modulo-6').then((m) => m.Modulo6),
  },
  {
    path: 'modulo-7',
    canActivate: [moduleUnlockGuard],
    data: { moduleId: 'inteligencia-artificial' },
    loadComponent: () => import('./modulo-7/modulo-7').then((m) => m.Modulo7),
  },
  {
    path: 'modulo-8',
    canActivate: [moduleUnlockGuard],
    data: { moduleId: 'entorno-laboral' },
    loadComponent: () => import('./modulo-8/modulo-8').then((m) => m.Modulo8),
  },
];
