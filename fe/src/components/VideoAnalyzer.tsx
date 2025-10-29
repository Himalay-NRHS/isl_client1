import { useState, useRef, useEffect } from 'react';
import { Camera, Video, StopCircle, Loader2, AlertCircle, CheckCircle2, VideoOff } from 'lucide-react';

export function VideoAnalyzer() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video element when stream or camera state changes
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      console.log('Attaching stream to video element');
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      
      console.log('Camera stream obtained:', stream.active);
      
      streamRef.current = stream;
      
      // Set camera active first, then useEffect will attach the stream
      setIsCameraActive(true);
      setError(null);
      
      console.log('Camera started successfully');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please make sure you have granted camera permissions.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    setError(null);
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        console.log('Recording stopped, blob size:', blob.size);
      };

      mediaRecorderRef.current = mediaRecorder;
      
      // Start countdown
      let count = 3;
      setCountdown(count);
      
      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countdownInterval);
          setCountdown(null);
          
          // Start recording after countdown
          try {
            mediaRecorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            console.log('Recording started');
            
            // Auto-stop after 10 seconds
            setTimeout(() => {
              if (mediaRecorderRef.current?.state === 'recording') {
                console.log('Auto-stopping recording after 10 seconds');
                stopRecording();
              }
            }, 10000);
          } catch (startErr) {
            console.error('Error starting MediaRecorder:', startErr);
            setError('Failed to start recording. Please try again.');
          }
        }
      }, 1000);

    } catch (err) {
      console.error('Error creating MediaRecorder:', err);
      setError('Failed to initialize recording. Your browser may not support this feature.');
      setCountdown(null);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        console.log('Stopping recording...');
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Error stopping recording');
    }
  };

  const handleAnalyze = async () => {
    if (!recordedBlob) {
      setError('No video recorded. Please record a video first.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    const file = new File([recordedBlob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
    formData.append('videoFile', file);

    try {
      const response = await fetch('http://localhost:3001/analyze-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || errorData.message || `Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data.result);
      
      // Clear recorded blob after successful analysis
      setRecordedBlob(null);

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze video. Check the backend console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecordedBlob(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Camera className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sign to Text Converter
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Record your sign language and get instant translation
        </p>
      </div>

      {/* Camera View */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video min-h-[400px]">
        {isCameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover absolute inset-0"
            style={{ transform: 'scaleX(-1)' }}
            onLoadedMetadata={(e) => {
              console.log('Video metadata loaded, playing...');
              e.currentTarget.play().catch(err => console.error('Error playing video:', err));
            }}
          />
        )}
        
        {!isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">Camera is off</p>
              <button
                onClick={startCamera}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <Camera className="w-5 h-5" />
                <span>Start Camera</span>
              </button>
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
            <div className="text-9xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && isCameraActive && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full animate-pulse z-10">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="font-medium">Recording...</span>
          </div>
        )}

        {/* Recorded Status */}
        {recordedBlob && !isRecording && isCameraActive && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full z-10">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Video Recorded</span>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      {isCameraActive && (
        <div className="flex justify-center space-x-4">
          {!isRecording && !recordedBlob && (
            <>
              <button
                onClick={startRecording}
                disabled={countdown !== null}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Video className="w-5 h-5" />
                <span>Start Recording (10s)</span>
              </button>
              <button
                onClick={stopCamera}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <VideoOff className="w-5 h-5" />
                <span>Stop Camera</span>
              </button>
            </>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 animate-pulse"
            >
              <StopCircle className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}

          {recordedBlob && !isRecording && (
            <>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Analyze Video</span>
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                Record Again
              </button>
            </>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                Error
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
          <div className="flex items-start mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-300">
              Translation Result
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-700">
            <p className="text-gray-900 dark:text-white text-lg leading-relaxed whitespace-pre-wrap">
              {result}
            </p>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-full">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              Processing your video ...
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            This may take a minute or two
          </p>
        </div>
      )}
    </div>
  );
}

export default VideoAnalyzer;