import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User as FirebaseUser,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { environment } from '../../environments/environment';
import { FirebaseWebConfig, isFirebaseConfigured } from '../../environments/firebase-config.model';

export const FIREBASE_CONFIG = new InjectionToken<FirebaseWebConfig | null>('FIREBASE_CONFIG', {
  providedIn: 'root',
  factory: () => environment.firebaseConfig,
});

export interface AuthUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string | null;
  provider: 'password' | 'google' | 'local';
  emailVerified: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface StoredLocalUser {
  uid: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
  createdAt: string;
}

const LOCAL_USERS_KEY = 'clickable_local_users_v1';
const LOCAL_SESSION_KEY = 'clickable_local_session_v1';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseConfig = inject(FIREBASE_CONFIG);
  private firebaseApp: FirebaseApp | null = null;
  private firebaseAuth: Auth | null = null;
  private initPromise: Promise<void>;

  readonly isFirebaseMode = signal<boolean>(isFirebaseConfigured(this.firebaseConfig));
  readonly currentUser = signal<AuthUser | null>(null);
  readonly authReady = signal<boolean>(false);

  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return 'C';
    const first = user.firstName?.trim().charAt(0) || '';
    const last = user.lastName?.trim().charAt(0) || '';
    const initials = (first + last).toUpperCase();
    return initials || user.displayName?.charAt(0).toUpperCase() || 'C';
  });

  constructor() {
    this.initPromise = this.initAuth();
  }

  private initAuth(): Promise<void> {
    if (this.isFirebaseMode() && this.firebaseConfig) {
      try {
        this.firebaseApp = getApps().length
          ? getApp()
          : initializeApp(this.firebaseConfig);
        this.firebaseAuth = getAuth(this.firebaseApp);

        if (this.firebaseConfig.measurementId) {
          isAnalyticsSupported()
            .then((supported) => {
              if (supported && this.firebaseApp) {
                getAnalytics(this.firebaseApp);
              }
            })
            .catch(() => {});
        }

        return new Promise<void>((resolve) => {
          let resolved = false;
          onAuthStateChanged(this.firebaseAuth!, (fbUser) => {
            this.currentUser.set(fbUser ? this.mapFirebaseUser(fbUser) : null);
            this.authReady.set(true);
            if (!resolved) {
              resolved = true;
              resolve();
            }
          });
        });
      } catch (err) {
        console.warn('Error iniciando Firebase Auth, cambiando a sesión local temporal:', err);
        this.isFirebaseMode.set(false);
      }
    }

    // Modo sesión local temporal mientras se configuran las credenciales de Firebase
    this.hydrateLocalSession();
    this.authReady.set(true);
    return Promise.resolve();
  }

  async waitForAuthInit(): Promise<boolean> {
    await this.initPromise;
    return this.isAuthenticated();
  }

  async loginWithEmail(email: string, password: string, remember = true): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();

    if (this.firebaseAuth && this.isFirebaseMode()) {
      try {
        await setPersistence(
          this.firebaseAuth,
          remember ? browserLocalPersistence : browserSessionPersistence
        );
        const cred = await signInWithEmailAndPassword(this.firebaseAuth, cleanEmail, password);
        const mapped = this.mapFirebaseUser(cred.user);
        this.currentUser.set(mapped);
        return mapped;
      } catch (error) {
        throw new Error(this.translateFirebaseError(error));
      }
    }

    // Respaldo local
    const users = this.readLocalUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found || found.password !== password) {
      throw new Error('Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.');
    }

    const user: AuthUser = {
      uid: found.uid,
      email: found.email,
      firstName: found.firstName,
      lastName: found.lastName,
      displayName: found.displayName,
      provider: 'local',
      emailVerified: true,
    };

    this.saveLocalSession(user, remember);
    this.currentUser.set(user);
    return user;
  }

  async registerWithEmail(payload: RegisterPayload): Promise<AuthUser> {
    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();
    const cleanEmail = payload.email.trim().toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();

    if (this.firebaseAuth && this.isFirebaseMode()) {
      try {
        const cred = await createUserWithEmailAndPassword(
          this.firebaseAuth,
          cleanEmail,
          payload.password
        );
        await updateProfile(cred.user, { displayName: fullName });

        const mapped: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          firstName,
          lastName,
          displayName: fullName,
          photoURL: cred.user.photoURL,
          provider: 'password',
          emailVerified: cred.user.emailVerified,
        };
        this.currentUser.set(mapped);
        return mapped;
      } catch (error) {
        throw new Error(this.translateFirebaseError(error));
      }
    }

    // Respaldo local
    const users = this.readLocalUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
    }

    const uid = 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    const newUser: StoredLocalUser = {
      uid,
      email: cleanEmail,
      password: payload.password,
      firstName,
      lastName,
      displayName: fullName,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

    const user: AuthUser = {
      uid,
      email: cleanEmail,
      firstName,
      lastName,
      displayName: fullName,
      provider: 'local',
      emailVerified: true,
    };
    this.saveLocalSession(user, true);
    this.currentUser.set(user);
    return user;
  }

  async loginWithGoogle(): Promise<AuthUser> {
    if (this.firebaseAuth && this.isFirebaseMode()) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const cred = await signInWithPopup(this.firebaseAuth, provider);
        const mapped = this.mapFirebaseUser(cred.user);
        this.currentUser.set(mapped);
        return mapped;
      } catch (error) {
        throw new Error(this.translateFirebaseError(error));
      }
    }

    throw new Error(
      'Para usar "Continuar con Google" real, agrega las credenciales de tu proyecto Firebase en src/environments/environment.ts. Mientras tanto, puedes registrarte o iniciar sesión con tu correo.'
    );
  }

  async resetPassword(email: string): Promise<string> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Escribe tu correo electrónico para enviarte el enlace de recuperación.');
    }

    if (this.firebaseAuth && this.isFirebaseMode()) {
      try {
        await sendPasswordResetEmail(this.firebaseAuth, cleanEmail);
        return `Hemos enviado un correo de recuperación a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`;
      } catch (error) {
        throw new Error(this.translateFirebaseError(error));
      }
    }

    const users = this.readLocalUsers();
    const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (!exists) {
      throw new Error('No encontramos ninguna cuenta local registrada con ese correo.');
    }
    return `Modo local: la cuenta ${cleanEmail} existe. Cuando configures Firebase Auth podrás recibir correos reales de recuperación.`;
  }

  async logout(): Promise<void> {
    if (this.firebaseAuth && this.isFirebaseMode()) {
      await signOut(this.firebaseAuth);
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
    this.currentUser.set(null);
  }

  private mapFirebaseUser(fbUser: FirebaseUser): AuthUser {
    const displayName = fbUser.displayName?.trim() || fbUser.email?.split('@')[0] || 'Estudiante';
    const parts = displayName.split(/\s+/);
    const firstName = parts[0] || 'Estudiante';
    const lastName = parts.slice(1).join(' ');
    const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');

    return {
      uid: fbUser.uid,
      email: fbUser.email || '',
      firstName,
      lastName,
      displayName,
      photoURL: fbUser.photoURL,
      provider: isGoogle ? 'google' : 'password',
      emailVerified: fbUser.emailVerified,
    };
  }

  private translateFirebaseError(error: unknown): string {
    const code = (error as { code?: string })?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Correo o contraseña incorrectos. Verifica tus datos.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Usa al menos 6 u 8 caracteres combinados.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/popup-closed-by-user':
        return 'Cerraste la ventana de Google antes de completar el acceso.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes e inténtalo de nuevo.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos seguidos. Espera un momento antes de volver a intentarlo.';
      case 'auth/network-request-failed':
        return 'Sin conexión a internet. Revisa tu red e inténtalo de nuevo.';
      case 'auth/operation-not-allowed':
        return 'Este método de acceso aún no está habilitado en Firebase Console (Authentication → Sign-in method).';
      case 'auth/configuration-not-found':
        return 'Falta activar Firebase Authentication en la consola de Firebase: entra a Build → Authentication → "Comenzar" (Get started) y habilita Correo/Contraseña y Google.';
      case 'auth/unauthorized-domain':
        return 'Este dominio (localhost) no está autorizado en Firebase Console → Authentication → Settings → Authorized domains.';
      default:
        return (error as { message?: string })?.message || 'Ocurrió un error al autenticar. Intenta de nuevo.';
    }
  }

  private readLocalUsers(): StoredLocalUser[] {
    try {
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveLocalSession(user: AuthUser, remember: boolean) {
    const raw = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(LOCAL_SESSION_KEY, raw);
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
    } else {
      sessionStorage.setItem(LOCAL_SESSION_KEY, raw);
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  }

  private hydrateLocalSession() {
    try {
      const raw =
        localStorage.getItem(LOCAL_SESSION_KEY) ||
        sessionStorage.getItem(LOCAL_SESSION_KEY);
      if (raw) {
        const user = JSON.parse(raw) as AuthUser;
        if (user?.uid) {
          this.currentUser.set(user);
        }
      }
    } catch {
      this.currentUser.set(null);
    }
  }
}
