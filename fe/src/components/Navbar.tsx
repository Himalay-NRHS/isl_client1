
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageDropdown } from './LanguageDropdown';

interface NavbarProps {
  currentView: 'converter' | 'learn';
  onViewChange: (view: 'converter' | 'learn') => void;
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">👋</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('nav.title')}
            </h1>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => onViewChange('converter')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                currentView === 'converter'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('nav.converter')}
            </button>
            <button
              onClick={() => onViewChange('learn')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                currentView === 'learn'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('nav.learn')}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Language Dropdown */}
          <LanguageDropdown />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-4 flex space-x-4">
        <button
          onClick={() => onViewChange('converter')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            currentView === 'converter'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('nav.converter')}
        </button>
        <button
          onClick={() => onViewChange('learn')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            currentView === 'learn'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('nav.learn')}
        </button>
      </div>
    </nav>
  );
}