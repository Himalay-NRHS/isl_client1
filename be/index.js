const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

// Initialize the Google GenAI with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Helper function to call Gemini API
async function generateContentWithGemini(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // latest model
      contents: prompt,
    });

    console.log("Gemini API response:", response.text);
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Translate route using Gemini API
app.post("/translate", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      error: "Missing text parameter",
    });
  }

  console.log(`Received text for translation: "${text}"`);

  try {
    const prompt = `
      Convert this English sentence: "${text}" 
      into a sequence of simple Indian Sign Language (ISL) words.
      Only use these available words: cat, child, sorry, dog, father, birds, girl, good, hard, hot, old, school, student, friend, share, score, chair, collect, depth, go.
      Return ONLY the words separated by spaces, with no punctuation or additional text.
      Use as many words as needed to convey the meaning accurately.
    `;

    const geminiResponse = await generateContentWithGemini(prompt);

    const availableWords = [
  "birds",
  "cat",
  "chair",
  "child",
  "collect",
  "depth",
  "dog",
  "father",
  "friend",
  "girl",
  "go",
  "good",
  "hard",
  "hot",
  "old",
  "school",
  "score",
  "share",
  "sorry",
  "student",
];


    const wordsArray = geminiResponse.toLowerCase().split(/\s+/);
    const validWords = wordsArray
      .map((w) => w.replace(/[,.;:"']/g, ""))
      .filter((w) => availableWords.includes(w));

    const translationText =
      validWords.length > 0 ? validWords.join(" ") : "dog child sorry";

    res.json({
      translation: translationText,
      original: text,
      fullGeminiResponse: geminiResponse,
    });
  } catch (error) {
    console.error("Error processing translation:", error);
    res.status(500).json({
      error: "Translation service error",
      message: error.message,
    });
  }
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

// Helper function to call Python verification script (kept for future use)
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

// --- Video file analysis endpoint (upload + Gemini File API) ---

// Ensure uploads directory exists
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Polling helper to wait until Gemini file processing is complete
async function pollForFileActive(fileName) {
  console.log(`Polling for file ${fileName} to become ACTIVE...`);
  let attempts = 0;
  const maxAttempts = 20; // ~100 seconds with 5s interval

  while (attempts < maxAttempts) {
    try {
      const fileInfo = await ai.files.get({ name: fileName });
      console.log(`File state: ${fileInfo.state}`);
      if (fileInfo.state === 'ACTIVE') return fileInfo;
      if (fileInfo.state === 'FAILED') throw new Error('File processing failed on Gemini');
    } catch (err) {
      console.warn('Warning while polling file state:', err.message || err);
    }

    await new Promise((r) => setTimeout(r, 5000));
    attempts++;
  }

  throw new Error('File processing timed out while waiting for ACTIVE state');
}

// Endpoint to upload a video file, send to Gemini File API and get transcription
app.post('/analyze-video', upload.single('videoFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  let uploadedFileName;

  try {
    console.log(`Received video upload: ${filePath} (${mimeType})`);

    // Upload the file to Gemini Files
    const uploaded = await ai.files.upload({
      file: filePath,
      mimeType,
      displayName: req.file.originalname,
    });

    uploadedFileName = uploaded.name;
    console.log('Uploaded to Gemini Files, name=', uploadedFileName);

    // Wait until the file is processed and ACTIVE
    await pollForFileActive(uploadedFileName);

    // Prepare prompt and model
    const model = 'gemini-2.5-pro';
    const prompt = 'This is an Indian Sign Language video. Decode the ISL gestures and provide an English translation.';

    // Send file + prompt to Gemini model
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { fileData: { mimeType: uploaded.mimeType, fileUri: uploaded.uri } },
            { text: prompt },
          ],
        },
      ],
    });

    const resultText = response.text;
    console.log('Gemini response:', resultText);

    res.json({ result: resultText });
  } catch (error) {
    console.error('Error in /analyze-video:', error);
    res.status(500).json({ error: 'Failed to analyze video', message: error.message });
  } finally {
    // Cleanup: delete uploaded file from Gemini and local disk
    if (uploadedFileName) {
      try {
        await ai.files.delete({ name: uploadedFileName });
        console.log(`Deleted file ${uploadedFileName} from Gemini`);
      } catch (err) {
        console.warn('Failed to delete file from Gemini:', err.message || err);
      }
    }

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted local upload:', filePath);
      }
    } catch (err) {
      console.warn('Failed to delete local upload:', err.message || err);
    }
  }
});
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`POST endpoint: http://localhost:${PORT}/translate`);
});
