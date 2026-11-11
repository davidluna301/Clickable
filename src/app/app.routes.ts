import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Profile } from './profile/profile';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  {
    path: 'register',
    component: Login,
    canActivate: [guestGuard],
    data: { initialMode: 'register' },
  },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  {
    path: 'game',
    canActivate: [authGuard],
    loadChildren: () => import('./game/game.routes').then((m) => m.GAME_ROUTES),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
