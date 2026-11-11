import { GlossaryCategory } from '../../shared/glossary.data';

export type Frame = 'email' | 'browser' | 'sms' | 'payment';

export type PartKind =
  | 'sender'
  | 'subject'
  | 'text'
  | 'link'
  | 'button'
  | 'url'
  | 'file'
  | 'app'
  | 'permission'
  | 'qr';

export interface Part {
  id: string;
  kind: PartKind;
  text: string;
  threat: boolean; // ¿es una señal de alerta?
  why: string; // explicación detallada al tocarla
  category?: string; // etiqueta corta: ej. 'Phishing · Dominio falso'
  whatItMeans?: string; // explicación pedagógica del concepto (qué es phishing, smishing, etc.)
  tip?: string; // regla práctica para recordar
  glossaryCategory?: GlossaryCategory;
  glossaryTermId?: string;
}

export interface Scenario {
  id: string;
  frame: Frame;
  title: string;
  contextLabel?: string;
  appHeader?: string;
  addressBar?: string;
  parts: Part[];
}

export interface GameModule {
  id: string;
  title: string;
  icon: string;
  description: string;
  nextRoute?: string;
  nextTitle?: string;
  glossaryCategory?: GlossaryCategory;
  tips: string[];
  scenarios: Scenario[];
}
