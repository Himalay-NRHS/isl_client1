import type { LearningModule } from '../types';

export const learningModules: LearningModule[] = [
  {
    id: 'alphabets',
    title: 'Alphabets',
    description: 'Learn the ISL alphabet signs from A to Z',
    icon: '🔤',
    lessons: [
      {
        id: 'a',
        title: 'Letter A',
        sign: 'A',
        meaning: { en: 'Letter A', gu: 'અક્ષર A' },
        videoUrl: '/videos/alphabet-a.mp4'
      },
      {
        id: 'b',
        title: 'Letter B',
        sign: 'B',
        meaning: { en: 'Letter B', gu: 'અક્ષર B' },
        videoUrl: '/videos/alphabet-b.mp4'
      },
      // Add more letters as needed
    ]
  },
  {
    id: 'numbers',
    title: 'Numbers',
    description: 'Learn numbers from 1 to 100 in ISL',
    icon: '🔢',
    lessons: [
      {
        id: '1',
        title: 'Number 1',
        sign: '1',
        meaning: { en: 'One', gu: 'એક' },
        videoUrl: '/videos/number-1.mp4'
      },
      {
        id: '2',
        title: 'Number 2',
        sign: '2',
        meaning: { en: 'Two', gu: 'બે' },
        videoUrl: '/videos/number-2.mp4'
      },
      // Add more numbers as needed
    ]
  },
  {
    id: 'common-phrases',
    title: 'Common Phrases',
    description: 'Essential phrases for daily communication',
    icon: '💬',
    lessons: [
      {
        id: 'hello',
        title: 'Hello',
        sign: 'Hello',
        meaning: { en: 'Hello', gu: 'નમસ્તે' },
        videoUrl: '/videos/hello.mp4',
        audioUrl: '/audio/hello.mp3'
      },
      {
        id: 'thank-you',
        title: 'Thank You',
        sign: 'Thank You',
        meaning: { en: 'Thank You', gu: 'આભાર' },
        videoUrl: '/videos/thank-you.mp4',
        audioUrl: '/audio/thank-you.mp3'
      },
      // Add more phrases as needed
    ]
  },
  {
    id: 'daily-activities',
    title: 'Daily Activities',
    description: 'Signs for common daily activities',
    icon: '🏃‍♂️',
    lessons: [
      {
        id: 'eat',
        title: 'Eat',
        sign: 'Eat',
        meaning: { en: 'Eat', gu: 'ખાવું' },
        videoUrl: '/videos/eat.mp4',
        audioUrl: '/audio/eat.mp3'
      },
      {
        id: 'sleep',
        title: 'Sleep',
        sign: 'Sleep',
        meaning: { en: 'Sleep', gu: 'સૂવું' },
        videoUrl: '/videos/sleep.mp4',
        audioUrl: '/audio/sleep.mp3'
      },
      // Add more activities as needed
    ]
  }
];