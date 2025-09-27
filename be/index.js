const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Simple translate route that returns "cat child sorry"
app.post('/translate', (req, res) => {
  res.json({
    translation: "cat child sorry"
  });
});

// Start practice mode endpoint - launches OpenCV detection directly
app.post('/api/start-practice', async (req, res) => {
  try {
    console.log('Starting OpenCV ISL Practice Mode...');
    
    const pythonScript = '../verify-model/ISLmodel/stable_isl_detection.py';
    const pythonPath = '../verify-model/venv_311/bin/python';
    
    // Launch the OpenCV detection in background
    const pythonProcess = spawn(pythonPath, [pythonScript], {
      cwd: __dirname,
      detached: true,
      stdio: 'inherit'
    });
    
    // Don't wait for the process to finish - let it run independently
    pythonProcess.unref();
    
    res.json({
      success: true,
      message: 'OpenCV ISL Practice Mode started! Check your camera.',
      pid: pythonProcess.pid
    });
    
  } catch (error) {
    console.error('Error starting practice mode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start OpenCV practice mode',
      message: error.message
    });
  }
});

// Sign verification endpoint
app.post('/api/verify-sign', async (req, res) => {
  try {
    const { image, expectedSign, modelId } = req.body;
    
    if (!image || !expectedSign) {
      return res.status(400).json({
        error: 'Missing required fields: image and expectedSign'
      });
    }

    console.log(`Verifying sign: ${expectedSign} for model: ${modelId}`);
    
    try {
      // Try to call the Python verification script
      const result = await callPythonVerification(image, expectedSign);
      
      res.json({
        isCorrect: result.is_correct,
        confidence: Math.round(result.confidence * 100),
        expectedSign,
        modelId,
        detectedSign: result.detected_sign,
        message: result.message || (result.is_correct ? 'Sign recognized correctly!' : 'Sign not recognized. Please try again.')
      });
      
    } catch (pythonError) {
      console.log('Python script failed, using demo mode:', pythonError.message);
      
      // Fallback to demo simulation if Python script fails
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isCorrect = Math.random() > 0.3; // 70% success rate for demo
      const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
      
      res.json({
        isCorrect,
        confidence: Math.round(confidence * 100),
        expectedSign,
        modelId,
        message: isCorrect ? 'Sign recognized correctly! (Demo Mode)' : 'Sign not recognized. Please try again. (Demo Mode)',
        demoMode: true
      });
    }
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Internal server error during sign verification',
      isCorrect: false,
      confidence: 0
    });
  }
});

// Helper function to call Python verification script
function callPythonVerification(base64Image, expectedSign) {
  return new Promise((resolve, reject) => {
    const pythonScript = '../verify-model/api_isl_detection.py';
    const pythonPath = '../verify-model/venv_311/bin/python';
    const pythonProcess = spawn(pythonPath, [pythonScript, base64Image, expectedSign], {
      cwd: __dirname
    });
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const parsedResult = JSON.parse(result.trim());
          resolve(parsedResult);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python script output: ${result}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${error}`));
      }
    });
    
    // Set a timeout for the Python process
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python script timeout'));
    }, 10000); // 10 second timeout
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`POST endpoint: http://localhost:${PORT}/translate`);
});
