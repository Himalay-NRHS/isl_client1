import { Camera, Type, Hand, Mic, Play, MicOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import GLBViewer from './GLBViewer';
import type { Mode } from '../types';

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechRecognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
  };

  const handleConvert = async () => {
    if (!inputText.trim()) return;
    
    setIsConverting(true);
    
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
        alert('Unexpected response format from translation service');
        setFullApiResponse('');
      }
      
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Failed to convert text. Please try again.');
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
            <button 
              onClick={toggleSpeechRecognition}
              disabled={!speechRecognition}
              className={`p-2 text-white rounded-xl transition-colors duration-200 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } ${!speechRecognition ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "🎤 Listening... Speak now!" : "Type your message here or click the microphone to speak..."}
          className={`w-full h-32 p-4 border rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-200 ${
            isListening 
              ? 'border-red-400 ring-2 ring-red-200 dark:border-red-500 dark:ring-red-800' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
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
        
        {/* Display selected words */}
        {wordsToAnimate && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Selected Sign Words:</h4>
            <div className="flex flex-wrap gap-2">
              {wordsToAnimate.split(' ').map((word, index) => (
                <span 
                  key={index} 
                  className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Display full API response */}
        {fullApiResponse && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Full AI Response:</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">{fullApiResponse}</p>
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