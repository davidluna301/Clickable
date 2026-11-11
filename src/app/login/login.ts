import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<AuthMode>('login');
  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  returnUrl = signal<string | null>(null);
  showTermsModal = signal(false);

  readonly isFirebaseMode = this.auth.isFirebaseMode;

  // Login form fields
  loginEmail = signal('');
  loginPassword = signal('');
  rememberMe = signal(true);
  showLoginPass = signal(false);

  // Register form fields
  regFirstName = signal('');
  regLastName = signal('');
  regEmail = signal('');
  regPassword = signal('');
  acceptTerms = signal(false);
  showRegPass = signal(false);

  // Forgot password field
  forgotEmail = signal('');

  // Dynamic password strength (0..4)
  passwordStrength = computed(() => {
    const pwd = this.regPassword();
    if (!pwd) return { score: 0, label: 'Mínimo 8 caracteres', level: 'empty' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) score++;

    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
    const levels = ['weak', 'weak', 'medium', 'strong', 'strong'];
    return {
      score,
      label: labels[score],
      level: levels[score],
    };
  });

  constructor() {
    const initialMode = this.route.snapshot.data['initialMode'] as AuthMode | undefined;
    const queryMode = this.route.snapshot.queryParamMap.get('mode') as AuthMode | null;
    const ret = this.route.snapshot.queryParamMap.get('returnUrl');

    if (ret) this.returnUrl.set(ret);
    if (initialMode === 'register' || queryMode === 'register') {
      this.mode.set('register');
    }
  }

  switchMode(next: AuthMode) {
    this.mode.set(next);
    this.errorMsg.set('');
    this.successMsg.set('');
    if (next === 'forgot' && this.loginEmail()) {
      this.forgotEmail.set(this.loginEmail());
    }
  }

  async submitLogin() {
    this.errorMsg.set('');
    this.successMsg.set('');

    const email = this.loginEmail().trim();
    const password = this.loginPassword();

    if (!this.isValidEmail(email)) {
      this.errorMsg.set('Ingresa un correo electrónico válido.');
      return;
    }
    if (!password) {
      this.errorMsg.set('Ingresa tu contraseña.');
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.loginWithEmail(email, password, this.rememberMe());
      await this.navigateAfterAuth();
    } catch (err) {
      this.errorMsg.set((err as Error).message || 'No se pudo iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }

  async submitRegister() {
    this.errorMsg.set('');
    this.successMsg.set('');

    const firstName = this.regFirstName().trim();
    const lastName = this.regLastName().trim();
    const email = this.regEmail().trim();
    const password = this.regPassword();

    if (firstName.length < 2) {
      this.errorMsg.set('Ingresa tu nombre (mínimo 2 letras).');
      return;
    }
    if (lastName.length < 2) {
      this.errorMsg.set('Ingresa tu apellido (mínimo 2 letras).');
      return;
    }
    if (!this.isValidEmail(email)) {
      this.errorMsg.set('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 8) {
      this.errorMsg.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!this.acceptTerms()) {
      this.errorMsg.set('Debes aceptar los términos y condiciones para crear tu cuenta.');
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.registerWithEmail({ firstName, lastName, email, password });
      await this.navigateAfterAuth(true);
    } catch (err) {
      this.errorMsg.set((err as Error).message || 'No se pudo completar el registro.');
    } finally {
      this.loading.set(false);
    }
  }

  async continueWithGoogle() {
    this.errorMsg.set('');
    this.successMsg.set('');
    this.loading.set(true);

    try {
      await this.auth.loginWithGoogle();
      await this.navigateAfterAuth();
    } catch (err) {
      this.errorMsg.set((err as Error).message || 'No se pudo conectar con Google.');
    } finally {
      this.loading.set(false);
    }
  }

  async submitForgot() {
    this.errorMsg.set('');
    this.successMsg.set('');

    const email = this.forgotEmail().trim();
    if (!this.isValidEmail(email)) {
      this.errorMsg.set('Ingresa un correo electrónico válido para enviarte la recuperación.');
      return;
    }

    this.loading.set(true);
    try {
      const msg = await this.auth.resetPassword(email);
      this.successMsg.set(msg);
    } catch (err) {
      this.errorMsg.set((err as Error).message || 'No se pudo enviar el correo de recuperación.');
    } finally {
      this.loading.set(false);
    }
  }

  private async navigateAfterAuth(isNewRegistration = false) {
    const target = isNewRegistration ? '/profile' : this.returnUrl() || '/profile';
    await this.router.navigateByUrl(target);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
