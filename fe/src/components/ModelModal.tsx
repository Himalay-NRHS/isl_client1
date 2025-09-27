import { X, Play, Volume2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import GLBViewer from './GLBViewer';
import type { SignModel } from '../data/models';
import type { Language } from '../types';

interface ModelModalProps {
  model: SignModel | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function ModelModal({ model, isOpen, onClose, language }: ModelModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };

  const handlePlaySign = () => {
    setIsPlaying(true);
  };

  if (!isOpen || !model) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              🤟
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {model.cleanName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? model.cleanName : model.gujaratiName}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-160px)] overflow-y-auto">
          {/* 3D Model Viewer */}
          <div className="relative">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden" style={{ height: '400px' }}>
              <GLBViewer 
                words={model.name.toLowerCase()}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>
            
            {/* Play Button Overlay when not playing */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-2xl">
                <button
                  onClick={handlePlaySign}
                  className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
                >
                  <Play className="w-8 h-8 text-blue-600 dark:text-blue-400 ml-1 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                </button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handlePlaySign}
              disabled={isPlaying}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              <Play className="w-5 h-5" />
              <span>
                {isPlaying 
                  ? (language === 'en' ? 'Playing...' : 'ચાલી રહ્યું છે...') 
                  : (language === 'en' ? 'Play Sign' : 'સાઇન ચલાવો')
                }
              </span>
            </button>
            
            {/* Audio button placeholder - can be implemented later */}
            <button
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              disabled
            >
              <Volume2 className="w-5 h-5" />
              <span>
                {language === 'en' ? 'Audio' : 'ઓડિયો'}
              </span>
            </button>
          </div>

          {/* Model Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'en' ? 'About this sign' : 'આ સાઇન વિશે'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {language === 'en' ? 'English:' : 'અંગ્રેજી:'}
                    </span>
                    <p className="text-gray-900 dark:text-white">{model.cleanName}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {language === 'en' ? 'Gujarati:' : 'ગુજરાતી:'}
                    </span>
                    <p className="text-gray-900 dark:text-white">{model.gujaratiName}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {language === 'en' ? 'Category:' : 'કેટેગરી:'}
                    </span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {model.category.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                </div>
                
                {model.description && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {language === 'en' ? 'Description:' : 'વર્ણન:'}
                    </span>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {model.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              💡 {language === 'en' ? 'Learning Tips' : 'શીખવાની ટિપ્સ'}
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• {language === 'en' ? 'Watch the hand movements carefully' : 'હાથની હિલચાલને ધ્યાનથી જુઓ'}</li>
              <li>• {language === 'en' ? 'Practice the sign slowly at first' : 'પહેલા ધીમેથી સાઇનનો અભ્યાસ કરો'}</li>
              <li>• {language === 'en' ? 'Pay attention to hand shape and position' : 'હાથના આકાર અને સ્થિતિ પર ધ્યાન આપો'}</li>
              <li>• {language === 'en' ? 'Repeat until the movement feels natural' : 'હલનચલન કુદરતી લાગે ત્યાં સુધી પુનરાવર્તન કરો'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}