// game/game.routes.ts
import { Routes } from '@angular/router';

export const GAME_ROUTES: Routes = [
  { path: '', redirectTo: 'modulo-1', pathMatch: 'full' },
  { path: 'modulo-1', loadComponent: () => import('./modulo-1/modulo-1').then(m => m.Modulo1) },
  { path: 'modulo-2', loadComponent: () => import('./modulo-2/modulo-2').then(m => m.Modulo2) },
  { path: 'modulo-3', loadComponent: () => import('./modulo-3/modulo-3').then(m => m.Modulo3) },
  { path: 'modulo-4', loadComponent: () => import('./modulo-4/modulo-4').then(m => m.Modulo4) },
];