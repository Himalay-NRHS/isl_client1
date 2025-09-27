import { en } from './en';
import { hi } from './hi';
import { kn } from './kn';
import { gu } from './gu';
import { ta } from './ta';
import { te } from './te';
import { bn } from './bn';
import { mr } from './mr';
import { pa } from './pa';
import { ml } from './ml';

export const translations = {
  en,
  hi,
  kn,
  gu,
  ta,
  te,
  bn,
  mr,
  pa,
  ml
};

export type TranslationKey = keyof typeof translations;
export type Translation = typeof en;

export const getTranslation = (language: string): Translation => {
  return translations[language as TranslationKey] || translations.en;
};