import { Camera, Type, Hand, Mic, Play } from 'lucide-react';
import { useState } from 'react';
import GLBViewer from './GLBViewer';
import type { Mode, Language } from '../types';

interface ConverterViewProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  language: Language;
}

export function ConverterView({ mode, onModeChange, language }: ConverterViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl inline-flex">
          <button
            onClick={() => onModeChange('sign-to-text')}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              mode === 'sign-to-text'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Hand className="w-5 h-5" />
            <span>{language === 'en' ? 'Sign to Text' : 'સાઇન ટુ ટેક્સ્ટ'}</span>
          </button>
          <button
            onClick={() => onModeChange('text-to-sign')}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              mode === 'text-to-sign'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-5 h-5" />
            <span>{language === 'en' ? 'Text to Sign' : 'ટેક્સ્ટ ટુ સાઇન'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-colors duration-200">
        {mode === 'sign-to-text' ? (
          <SignToTextMode language={language} />
        ) : (
          <TextToSignMode language={language} />
        )}
      </div>
    </div>
  );
}

function SignToTextMode({ language }: { language: Language }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'en' ? 'Sign to Text Converter' : 'સાઇન ટુ ટેક્સ્ટ કન્વર્ટર'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'en' 
            ? 'Show your signs to the camera and we\'ll convert them to text'
            : 'કેમેરામાં તમારા સાઇન બતાવો અને અમે તેને ટેક્સ્ટમાં કન્વર્ટ કરીશું'
          }
        </p>
      </div>

      {/* Camera View */}
      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-2xl aspect-video flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {language === 'en' ? 'Camera not active' : 'કેમેરા સક્રિય નથી'}
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
            <Play className="w-5 h-5" />
            <span>{language === 'en' ? 'Start Camera' : 'કેમેરા શરૂ કરો'}</span>
          </button>
        </div>
      </div>

      {/* Output Text */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {language === 'en' ? 'Detected Text:' : 'શોધાયેલ ટેક્સ્ટ:'}
        </h3>
        <div className="min-h-[100px] bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400 italic">
            {language === 'en' 
              ? 'Translated text will appear here...'
              : 'અનુવાદિત ટેક્સ્ટ અહીં દેખાશે...'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

function TextToSignMode({ language }: { language: Language }) {
  const [inputText, setInputText] = useState('');
  const [wordsToAnimate, setWordsToAnimate] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!inputText.trim()) return;
    
    setIsConverting(true);
    
    try {
      // Here you would typically call your backend API
      // For now, we'll simulate the backend response
      // const response = await fetch('/api/text-to-sign', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: inputText })
      // });
      // const data = await response.json();
      
      // Simulate backend processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate backend response - in real implementation, this would come from your API
      setWordsToAnimate(inputText.toLowerCase().trim());
      
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleAnimationComplete = () => {
    console.log('Animation sequence completed!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'en' ? 'Text to Sign Converter' : 'ટેક્સ્ટ ટુ સાઇન કન્વર્ટર'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'en' 
            ? 'Type your message and see it converted to ISL signs'
            : 'તમારો સંદેશ ટાઇપ કરો અને તેને ISL સાઇનમાં કન્વર્ટ થતો જુઓ'
          }
        </p>
      </div>

      {/* Text Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'en' ? 'Enter Text:' : 'ટેક્સ્ટ દાખલ કરો:'}
          </h3>
          <div className="flex space-x-2">
            <button className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors duration-200">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={language === 'en' ? 'Type your message here...' : 'તમારો સંદેશ અહીં ટાઇપ કરો...'}
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-200"
        />
      </div>

      {/* Sign Display */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {language === 'en' ? 'ISL Signs:' : 'ISL સાઇન્સ:'}
        </h3>
        <div className="h-[400px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <GLBViewer 
            words={wordsToAnimate} 
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      </div>

      {/* Convert Button */}
      <div className="text-center">
        <button 
          onClick={handleConvert}
          disabled={!inputText.trim() || isConverting}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          {isConverting 
            ? (language === 'en' ? 'Converting...' : 'કન્વર્ટ કરી રહ્યું છે...')
            : (language === 'en' ? 'Convert to Signs' : 'સાઇનમાં કન્વર્ટ કરો')
          }
        </button>
      </div>
    </div>
  );
}