import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-nav.html',
  styleUrl: './public-nav.css',
})
export class PublicNav {
  auth = inject(AuthService);
  private router = inject(Router);

  activePage = input<'home' | 'login' | 'register' | 'classroom'>('home');
  scrolled = input(false);

  authSwitch = output<'login' | 'register'>();

  goToSection(sectionId: string) {
    const cleanUrl = this.router.url.split('#')[0].split('?')[0];
    if (cleanUrl === '/home' || cleanUrl === '/' || cleanUrl === '') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    this.router.navigateByUrl('/home').then(() => {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 90);
    });
  }

  handleAuthNav(target: 'login' | 'register') {
    if (this.activePage() === 'home') {
      this.router.navigateByUrl(target === 'register' ? '/register' : '/login');
      return;
    }
    this.authSwitch.emit(target);
  }
}
