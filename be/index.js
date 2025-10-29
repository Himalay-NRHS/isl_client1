const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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

// Configure Multer for video file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp to avoid filename conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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

// Helper function for polling file status
const pollForFileActive = async (fileName) => {
  console.log(`Polling for file ${fileName} to become ACTIVE...`);
  let file = await ai.files.get({ name: fileName });
  let attempts = 0;
  const maxAttempts = 20; // Set a timeout (e.g., 20 attempts * 5s = 100s)

  while (file.state === 'PROCESSING' && attempts < maxAttempts) {
    // Wait for 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
    file = await ai.files.get({ name: fileName });
    attempts++;
    console.log(`File state is: ${file.state} (Attempt ${attempts})`);
  }

  if (file.state === 'ACTIVE') {
    console.log('File is ACTIVE!');
    return file;
  } else if (file.state === 'FAILED') {
    throw new Error('File processing failed on the server.');
  } else {
    throw new Error('File processing timed out.');
  }
};

// Video to Text Analysis Endpoint using Gemini API
app.post('/analyze-video', upload.single('videoFile'), async (req, res) => {
  
  // 1. Check for file upload
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded.' });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  let uploadedFile;
  let fileApiName; // To store the file name for deletion

  try {
    console.log(`Uploading file: ${filePath} with MIME type: ${mimeType}`);

    // 2. Upload the video to the Gemini File API
    uploadedFile = await ai.files.upload({
      file: filePath,
      mimeType: mimeType,
      displayName: req.file.originalname,
    });
    
    // Store the name for deletion later
    fileApiName = uploadedFile.name; 

    // 3. Poll for the file to be ACTIVE
    await pollForFileActive(fileApiName);

    // 4. Define the prompt and model
    const model = 'gemini-2.5-pro';
    const prompt = 'This is an Indian Sign Language video. Decode the sign language and provide the translation in English text.';

    // 5. Send the file and prompt to the model
    console.log('Sending video and prompt to Gemini...');
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            {
              fileData: {
                mimeType: uploadedFile.mimeType,
                fileUri: uploadedFile.uri,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    // 6. Console log the result
    const resultText = response.text;
    console.log('--- Gemini API Result ---');
    console.log(resultText);
    console.log('-------------------------');

    // 7. Send the result back to the frontend
    res.status(200).json({ 
      result: resultText,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ 
      error: 'Error processing video with Gemini API.',
      message: error.message 
    });
  } finally {
    // 8. Delete the file from the Gemini service and the local server
    if (fileApiName) {
      try {
        await ai.files.delete({ name: fileApiName });
        console.log(`Deleted file ${fileApiName} from Gemini.`);
      } catch (delError) {
        console.error('Error deleting file from Gemini:', delError);
      }
    }
    // Ensure local file is deleted
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted local file: ${filePath}`);
    }
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
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`POST endpoint: http://localhost:${PORT}/translate`);
});
