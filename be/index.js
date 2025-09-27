const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

// Initialize the Google GenAI with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`POST endpoint: http://localhost:${PORT}/translate`);
});
