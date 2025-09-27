import { Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { SignModel } from '../data/models';

interface ModelCardProps {
  model: SignModel;
  onClick: () => void;
}

export function ModelCard({ model, onClick }: ModelCardProps) {
  const { t } = useLanguage();
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Model Preview Area */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl aspect-square mb-4 flex items-center justify-center overflow-hidden">
        {/* Placeholder for 3D model thumbnail */}
        <div className="text-6xl opacity-70 group-hover:scale-110 transition-transform duration-300">
          🤟
        </div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="w-6 h-6 text-gray-700 ml-1" />
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm">
          {model.category}
        </div>
      </div>

      {/* Model Information */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {model.cleanName}
        </h3>
        
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {t(`models.${model.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`) || model.cleanName}
        </p>
        
        {model.description && (
          <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 leading-relaxed">
            {model.description}
          </p>
        )}
      </div>

      {/* Action area */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
            {model.category.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <div className="text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Play className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}