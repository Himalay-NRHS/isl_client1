export type Mode = 'sign-to-text' | 'text-to-sign';
export type Language = 'en' | 'hi' | 'kn' | 'gu' | 'ta' | 'te' | 'bn' | 'mr' | 'pa' | 'ml';
export type Theme = 'light' | 'dark';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  sign: string;
  meaning: {
    en: string;
    gu: string;
  };
  videoUrl?: string;
  audioUrl?: string;
}