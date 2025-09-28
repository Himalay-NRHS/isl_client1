#!/bin/bash

# ISL OpenCV Model Server Startup Script

echo "🚀 Starting ISL OpenCV Detection Server..."

# Change to the verify-model directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv_311" ]; then
    echo "❌ Virtual environment 'venv_311' not found!"
    echo "Please make sure the virtual environment is set up correctly."
    exit 1
fi

# Activate virtual environment and check dependencies
echo "📦 Checking Python dependencies..."
./venv_311/bin/python -c "import tensorflow, mediapipe, cv2; print('✅ All dependencies available')" || {
    echo "❌ Missing dependencies. Please install requirements:"
    echo "   ./venv_311/bin/pip install -r ISLmodel/requirements.txt"
    exit 1
}

# Check if model file exists
if [ ! -f "ISLmodel/model.h5" ]; then
    echo "❌ Model file 'ISLmodel/model.h5' not found!"
    exit 1
fi

echo "✅ Dependencies and model verified"
echo "🔧 Ready to serve ISL detection requests"
echo "📡 Backend API will call this Python environment for sign verification"
echo ""
echo "💡 Usage:"
echo "   - The Node.js backend (port 3001) will automatically call Python scripts"
echo "   - Click 'Practice Sign' button in the frontend to test the integration"
echo "   - Python environment: $(pwd)/venv_311/bin/python"
echo ""
echo "🏃 To manually test the detection model, run:"
echo "   ./venv_311/bin/python ISLmodel/stable_isl_detection.py"
echo ""
echo "🎯 ISL OpenCV Server is ready!"