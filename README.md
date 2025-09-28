# SilenceSpeaks: Two-Way Indian Sign Language Translator

## Problem Statement

Over 63 million hearing-impaired Indians face severe barriers in education and daily communication.
- Lack of tools for Indian Sign Language (ISL) → existing apps are ASL-based or limited to static videos.
- Absence of ISL grammar support leads to unnatural translations and broken communication.
- Deaf and mute individuals remain dependent on interpreters, limiting independence and inclusivity.

## What We Are Building

A multilingual platform for two-way communication:
- **ISL Gestures → Converted into Text and Speech**
- **Speech or Text (Indian languages) → Translated into ISL Grammar → Rendered through a 3D Signing Avatar**
- Functions as both a communication bridge and an educational tool for ISL learning.

## Uniqueness & Innovation

- ISL Grammar Engine for natural syntax (beyond word-to-sign mapping)
- 3D Animated Avatar delivering smooth, continuous signing
- Multilingual Input Support: Accepts speech/text in multiple Indian languages and renders them in ISL

## Project Overview

SilenceSpeaks is a comprehensive two-way Indian Sign Language (ISL) translation platform designed to bridge communication gaps for the hearing-impaired community in India. The platform leverages AI and 3D animation to create natural, grammatically correct translations between spoken/written language and Indian Sign Language.

## Features

### Text to Sign Conversion
- Convert text input in multiple Indian languages to ISL signs
- AI-powered translation using Gemini API for accurate sign selection
- Grammatically correct sign sequencing using ISL grammar rules

### Sign to Text Conversion (Planned/In Development)
- Camera-based sign language detection
- Real-time conversion of detected signs to text
- Support for continuous signing sequences

### 3D Avatar Visualization
- High-quality 3D models for each sign
- Smooth animations between signs
- Realistic rendering of hand movements and gestures

### Multilingual Support
- Input text in multiple Indian languages including:
  - Hindi
  - Bengali
  - Gujarati
  - Marathi
  - Tamil
  - Telugu
  - Kannada
  - Malayalam
  - Punjabi

### Learning Module
- Educational content for learning ISL
- Practice exercises with interactive feedback
- Progress tracking for learners

## Technical Architecture

### Frontend
- React + TypeScript application with Vite build system
- Three.js for 3D model rendering and animation
- Tailwind CSS for responsive UI design
- Context-based state management

### Backend
- Node.js Express server
- Google Gemini API for AI-powered translations
- RESTful API endpoints for translation services

### 3D Models
- GLB format models for optimal web performance
- Custom animations for natural signing movements
- Optimized for real-time rendering in web browsers

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Google Gemini API key (for backend services)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Himalay-NRHS/isl_client1.git
cd isl_client1
```

2. Install frontend dependencies
```bash
cd fe
npm install
```

3. Install backend dependencies
```bash
cd ../be
npm install
```

4. Set up environment variables
Create a `.env` file in the `be` directory:
```
PORT=3001
GEMINI_API_KEY=your_api_key_here
```

5. Start the backend server
```bash
npm start
```

6. Start the frontend application (in a new terminal)
```bash
cd ../fe
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

## Usage

### Text to Sign Translation
1. Select "Text to Sign" mode
2. Enter text in your preferred language
3. Click "Convert to Signs" button
4. View the animated 3D avatar performing the signs
5. The translated sign words will appear below the animation

### Learning ISL
1. Navigate to the Learn section
2. Browse through available learning modules
3. Watch sign demonstrations and practice

## Future Enhancements

- Integration of computer vision for sign detection and interpretation
- Expanded sign vocabulary beyond the current set
- Mobile application for on-the-go translation
- Offline functionality for use without internet connection
- Enhanced ISL grammar engine for more natural translations
- Community contribution platform for adding new signs

## Contributors

- Team SilenceSpeaks

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*This project was developed for the Smart India Hackathon (SIH) 2024.*