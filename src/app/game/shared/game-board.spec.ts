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

  it('shows positive mockup overlay and awards XP when picking a threat', () => {
    const fixture = TestBed.createComponent(GameBoard);
    fixture.componentRef.setInput('module', MODULO_1);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const threatPart = MODULO_1.scenarios[0].parts.find((p) => p.threat)!;

    comp.pick(threatPart);
    fixture.detectChanges();

    expect(comp.xp()).toBe(10);
    expect(comp.lives()).toBe(3);
    expect(comp.overlay()?.isPositive).toBe(true);
    expect(comp.overlay()?.whatItMeans).toBeTruthy();
  });

  it('shows negative mockup overlay, deducts 1 life, and waits for Continue on safe part click', () => {
    const fixture = TestBed.createComponent(GameBoard);
    fixture.componentRef.setInput('module', MODULO_1);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const safePart = MODULO_1.scenarios[0].parts.find((p) => !p.threat)!;

    comp.pick(safePart);
    fixture.detectChanges();

    expect(comp.lives()).toBe(2);
    expect(comp.overlay()?.isPositive).toBe(false);
    expect(comp.overlay()?.actionType).toBe('resume');

    comp.handleOverlayAction();
    expect(comp.overlay()).toBeNull();
    expect(comp.status()).toBe('playing');
  });
});
