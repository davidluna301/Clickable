import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from '../../home/home';
import { Login } from '../../login/login';
import { AuthService, FIREBASE_CONFIG } from '../../services/auth.service';
import { PublicNav } from './public-nav';

describe('Unified PublicNav & Public Home privacy/deduplication', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PublicNav, Home, Login],
      providers: [provideRouter([]), { provide: FIREBASE_CONFIG, useValue: null }],
    }).compileComponents();

    const auth = TestBed.inject(AuthService);
    await auth.waitForAuthInit();
  });

  it('uses the same PublicNav structure across Home and Login without exposing Glossary', () => {
    const homeFixture = TestBed.createComponent(Home);
    homeFixture.detectChanges();
    const homeEl = homeFixture.nativeElement as HTMLElement;

    const homeNavLinks = Array.from(homeEl.querySelectorAll('app-public-nav .pub-link-btn')).map(
      (el) => el.textContent?.trim()
    );
    expect(homeNavLinks).toEqual(['Inicio', 'Amenazas', 'Aprende']);
    expect(homeEl.querySelector('app-help-glossary')).toBeNull();
    expect(homeEl.textContent?.toLowerCase()).not.toContain('glosario');

    const loginFixture = TestBed.createComponent(Login);
    loginFixture.detectChanges();
    const loginEl = loginFixture.nativeElement as HTMLElement;

    const loginNavLinks = Array.from(loginEl.querySelectorAll('app-public-nav .pub-link-btn')).map(
      (el) => el.textContent?.trim()
    );
    expect(loginNavLinks).toEqual(homeNavLinks);
  });

  it('keeps only one "Iniciar sesión" link (in nav) and one "Crear cuenta gratis" CTA on Home', () => {
    const homeFixture = TestBed.createComponent(Home);
    homeFixture.detectChanges();
    const homeEl = homeFixture.nativeElement as HTMLElement;

    const navCtaText = homeEl.querySelector('app-public-nav .pub-cta-btn')?.textContent?.trim();
    expect(navCtaText).toContain('Iniciar sesión');

    const loginMatches = (homeEl.textContent || '').match(/Iniciar sesión/gi) || [];
    const registerMatches = (homeEl.textContent || '').match(/Crear cuenta/gi) || [];
    expect(loginMatches.length).toBe(1);
    expect(registerMatches.length).toBe(1);
  });
});
