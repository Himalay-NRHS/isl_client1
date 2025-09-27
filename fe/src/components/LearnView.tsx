import { Play, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { learningModules } from '../data/learningModules';
import type { Language, LearningModule } from '../types';

interface LearnViewProps {
  language: Language;
}

export function LearnView({ language }: LearnViewProps) {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  if (selectedModule) {
    return (
      <LessonView
        module={selectedModule}
        currentLessonIndex={currentLessonIndex}
        onLessonChange={setCurrentLessonIndex}
        onBack={() => setSelectedModule(null)}
        language={language}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6">
          <span className="text-4xl">👋</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {language === 'en' ? 'Learn Indian Sign Language (ISL)' : 'ભારતીય સાઇન લેંગ્વેજ (ISL) શીખો'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {language === 'en' 
            ? 'Master ISL with interactive lessons, from basic alphabets to daily conversations'
            : 'મૂળભૂત અક્ષરોથી લઈને દૈનિક વાતચીત સુધી, ઇન્ટરેક્ટિવ પાઠો સાથે ISL માં નિપુણતા મેળવો'
          }
        </p>
      </div>

      {/* Learning Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {learningModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            language={language}
            onClick={() => setSelectedModule(module)}
          />
        ))}
      </div>

      {/* Progress Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'en' ? 'Your Learning Journey' : 'તમારી શીખવાની યાત્રા'}
          </h2>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Lessons Completed' : 'પાઠ પૂર્ણ'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Signs Learned' : 'સાઇન શીખ્યા'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Streak Days' : 'સતત દિવસો'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ module, language, onClick }: {
  module: LearningModule;
  language: Language;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
          {module.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {module.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {module.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {module.lessons.length} {language === 'en' ? 'lessons' : 'પાઠ'}
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200">
              {language === 'en' ? 'Start Learning' : 'શીખવાનું શરૂ કરો'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonView({ 
  module, 
  currentLessonIndex, 
  onLessonChange, 
  onBack, 
  language 
}: {
  module: LearningModule;
  currentLessonIndex: number;
  onLessonChange: (index: number) => void;
  onBack: () => void;
  language: Language;
}) {
  const lesson = module.lessons[currentLessonIndex];
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === module.lessons.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{language === 'en' ? 'Back to Modules' : 'મોડ્યુલ પર પાછા'}</span>
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentLessonIndex + 1} / {module.lessons.length}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-colors duration-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lesson.title}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <span className="text-gray-900 dark:text-white font-medium">
              {lesson.meaning.en}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              {lesson.meaning.gu}
            </span>
          </div>
        </div>

        {/* Video/Sign Display */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl aspect-video mb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎥</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {language === 'en' ? 'Sign video placeholder' : 'સાઇન વિડિયો પ્લેસહોલ્ડર'}
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
              <Play className="w-5 h-5" />
              <span>{language === 'en' ? 'Play Video' : 'વિડિયો ચલાવો'}</span>
            </button>
          </div>
        </div>

        {/* Audio Button */}
        {lesson.audioUrl && (
          <div className="text-center mb-8">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
              <Volume2 className="w-5 h-5" />
              <span>{language === 'en' ? 'Play Pronunciation' : 'ઉચ્ચાર સાંભળો'}</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onLessonChange(currentLessonIndex - 1)}
            disabled={isFirstLesson}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
              isFirstLesson
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{language === 'en' ? 'Previous' : 'પાછળ'}</span>
          </button>

          <button
            onClick={() => onLessonChange(currentLessonIndex + 1)}
            disabled={isLastLesson}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
              isLastLesson
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <span>{language === 'en' ? 'Next' : 'આગળ'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}