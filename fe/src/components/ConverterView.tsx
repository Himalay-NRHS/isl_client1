import { Camera, Type, Hand, Mic, Play } from 'lucide-react';
import { useState } from 'react';
import GLBViewer from './GLBViewer';
import type { Mode } from '../types';

interface ConverterViewProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function ConverterView({ mode, onModeChange }: ConverterViewProps) {
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
            <span>Sign to Text</span>
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
            <span>Text to Sign</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-colors duration-200">
        {mode === 'sign-to-text' ? (
          <SignToTextMode />
        ) : (
          <TextToSignMode />
        )}
      </div>
    </div>
  );
}

function SignToTextMode() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sign to Text Converter
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Show your signs to the camera and we'll convert them to text
        </p>
      </div>

      {/* Camera View */}
      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-2xl aspect-video flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Camera not active
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
            <Play className="w-5 h-5" />
            <span>Start Camera</span>
          </button>
        </div>
      </div>

      {/* Output Text */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Detected Text:
        </h3>
        <div className="min-h-[100px] bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400 italic">
            Translated text will appear here...
          </p>
        </div>
      </div>
    </div>
  );
}

function TextToSignMode() {
  const [inputText, setInputText] = useState('');
  const [wordsToAnimate, setWordsToAnimate] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [fullApiResponse, setFullApiResponse] = useState('');
  const [conversionError, setConversionError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!inputText.trim()) return;
    
    setIsConverting(true);
    setConversionError(null);
    setWordsToAnimate('');
    setFullApiResponse('');
    
    try {
      // Call the backend API to translate text to sign words
      const response = await fetch('http://localhost:3001/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received translation:', data);
      
      // Set the words to animate and store full API response
      if (data && data.translation) {
        setWordsToAnimate(data.translation);
        console.log('Models to animate:', data.translation.split(' ').map((word: string) => `${word}.glb`));
        
        // Store the full API response if available
        if (data.fullGeminiResponse) {
          setFullApiResponse(data.fullGeminiResponse);
        } else {
          setFullApiResponse('(API response format did not include full text)');
        }
      } else {
        console.error('Translation response missing expected format:', data);
        setConversionError('Unexpected response format from translation service');
        setFullApiResponse(JSON.stringify(data, null, 2));
      }
      
    } catch (error) {
      console.error('Conversion failed:', error);
      setConversionError(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          Text to Sign Converter
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Type your message and see it converted to ISL signs
        </p>
      </div>

      {/* Text Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Enter Text:
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
          placeholder="Type your message here..."
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-200"
        />
      </div>

      {/* Sign Display */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ISL Signs:
        </h3>
        <div className="h-[400px] bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <GLBViewer 
            words={wordsToAnimate} 
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
        
        {/* Error message display */}
        {conversionError && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300">Translation Failed</h4>
                <p className="mt-1 text-red-700 dark:text-red-300 text-sm">{conversionError}</p>
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">Try again with a different phrase or check the server connection.</p>
              </div>
            </div>
          </div>
        )}

        {/* Translation Results Section */}
        {wordsToAnimate && (
          <div className="mt-4 space-y-3">
            {/* Sign Words Display */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Selected Sign Words:</h4>
              <div className="flex flex-wrap gap-2">
                {wordsToAnimate.split(' ').map((word, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium"
                  >
                    {word}
                  </span>
                ))}
              </div>
              
              {/* Original Text */}
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50">
                <h5 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Original Text:</h5>
                <p className="text-blue-600 dark:text-blue-300 text-sm">{inputText}</p>
              </div>
            </div>
            
            {/* Collapsible API Response */}
            {fullApiResponse && (
              <details className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <summary className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Show AI Response Details
                </summary>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800/80 rounded overflow-auto max-h-40">
                    {fullApiResponse}
                  </pre>
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Convert Button */}
      <div className="text-center">
        <button 
          onClick={handleConvert}
          disabled={!inputText.trim() || isConverting}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          {isConverting ? 'Converting...' : 'Convert to Signs'}
        </button>
      </div>
    </div>
  );
}