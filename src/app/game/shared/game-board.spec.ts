import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MODULO_1 } from '../modulo-1/modulo-1.data';
import { GameBoard } from './game-board';

describe('GameBoard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoard],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders pure simulator without card-list view switcher and awards XP on threat pick', () => {
    const fixture = TestBed.createComponent(GameBoard);
    fixture.componentRef.setInput('module', MODULO_1);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.querySelector('.view-switcher')).toBeNull();
    expect(hostEl.querySelector('.desktop-cards-panel')).toBeNull();

    const comp = fixture.componentInstance;
    const savedEvents: number[] = [];
    comp.checkpointSaved.subscribe((cp) => savedEvents.push(cp.xp));

    const threatPart = MODULO_1.scenarios[0].parts.find((p) => p.threat)!;
    comp.pick(threatPart);
    fixture.detectChanges();

    expect(comp.xp()).toBe(10);
    expect(comp.lives()).toBe(3);
    expect(comp.overlay()?.isPositive).toBe(true);
    expect(comp.overlay()?.whatItMeans).toBeTruthy();
    expect(savedEvents).toEqual([10]);
  });

  it('deducts 1 life when clicking a safe element and restores saved checkpoints', () => {
    const fixture = TestBed.createComponent(GameBoard);
    fixture.componentRef.setInput('module', MODULO_1);
    fixture.componentRef.setInput('initialCheckpoint', {
      scenarioIndex: 1,
      xp: 40,
      lives: 3,
      found: [],
      wrong: [],
      closed: false,
      threatsDetected: 4,
      mistakesCount: 0,
      updatedAt: new Date().toISOString(),
    });
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.index()).toBe(1);
    expect(comp.xp()).toBe(40);

    const safePart = MODULO_1.scenarios[1].parts.find((p) => !p.threat)!;
    comp.pick(safePart);
    fixture.detectChanges();

    expect(comp.lives()).toBe(2);
    expect(comp.overlay()?.isPositive).toBe(false);
    expect(comp.overlay()?.actionType).toBe('resume');

    comp.handleOverlayAction();
    expect(comp.overlay()).toBeNull();
    expect(comp.status()).toBe('playing');
  });

  it('renders realistic webmail UI for email scenarios and splits CTA destination URLs cleanly', () => {
    const fixture = TestBed.createComponent(GameBoard);
    fixture.componentRef.setInput('module', MODULO_1);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.querySelector('.webmail-shell')).not.toBeNull();
    expect(hostEl.querySelector('.mail-letter-paper')).not.toBeNull();
    expect(hostEl.querySelector('.real-cta-btn')?.textContent?.trim()).toContain('Verificar mi cuenta');
    expect(hostEl.querySelector('.link-destination-chip')?.textContent?.trim()).toContain(
      'http://bit.ly/x82k'
    );

    const comp = fixture.componentInstance;
    expect(comp.emailBrand().senderName).toBe('Banco Seguridad');
    expect(comp.splitButtonArrow('Verificar mi cuenta → http://bit.ly/x82k')).toEqual({
      label: 'Verificar mi cuenta',
      target: 'http://bit.ly/x82k',
    });
  });

  it('shows instant surprise celebration overlay when all suspicious parts in an exercise are found', () => {
    const fixture = TestBed.createComponent(GameBoard);
    fixture.componentRef.setInput('module', MODULO_1);
    fixture.componentRef.setInput('initialCheckpoint', {
      scenarioIndex: 1,
      xp: 40,
      lives: 3,
      found: [],
      wrong: [],
      closed: false,
      threatsDetected: 4,
      mistakesCount: 0,
      updatedAt: new Date().toISOString(),
    });
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const threatPart = MODULO_1.scenarios[1].parts.find((p) => p.threat)!;
    comp.pick(threatPart);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(comp.xp()).toBe(70);
    expect(comp.closed()).toBe(true);
    expect(comp.overlay()?.celebration).toBe(true);
    expect(comp.overlay()?.kind).toBe('stage-clear');
    expect(comp.overlay()?.foundParts?.length).toBe(1);
    expect(comp.overlay()?.actionType).toBe('advance');
    expect(hostEl.querySelector('.feedback-overlay.is-celebration')).not.toBeNull();
    expect(hostEl.querySelector('.found-summary-card')).not.toBeNull();
    expect(hostEl.querySelector('.overlay-continue-btn')?.textContent).toContain('Siguiente ejercicio');

    comp.handleOverlayAction();
    fixture.detectChanges();
    expect(comp.index()).toBe(2);
    expect(comp.overlay()).toBeNull();
  });
});
