#!/usr/bin/env python3
"""
ISL Detection API Bridge
Integrates the stable ISL detection model with the web API
"""

import sys
import json
import base64
import cv2
import numpy as np
import os
from pathlib import Path
import mediapipe as mp
import pandas as pd
import string
from tensorflow import keras
import copy
import itertools
import warnings
warnings.filterwarnings('ignore')

class APIISLDetector:
    def __init__(self):
        """Initialize the ISL detector for API use"""
        # Get the directory of this script
        script_dir = Path(__file__).parent
        model_dir = script_dir / "ISLmodel"
        model_path = model_dir / "model.h5"
        
        # Load model
        try:
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            self.model = keras.models.load_model(str(model_path))
            print(f"✅ Model loaded: {model_path}", file=sys.stderr)
        except Exception as e:
            raise Exception(f"❌ Error loading model: {e}")
        
        # Define alphabet (matching original training order)
        self.alphabet = ['1','2','3','4','5','6','7','8','9']
        self.alphabet += list(string.ascii_uppercase)
        
        # Initialize MediaPipe
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            model_complexity=0,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        
        print(f"📋 Classes: {len(self.alphabet)} - {self.alphabet}", file=sys.stderr)

    def decode_base64_image(self, base64_string):
        """Decode base64 image string to OpenCV image"""
        try:
            # Remove the data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64 to bytes
            image_bytes = base64.b64decode(base64_string)
            
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            
            # Decode to OpenCV image
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            return image
        except Exception as e:
            raise Exception(f"Failed to decode base64 image: {str(e)}")

    def calc_landmark_list(self, image, landmarks):
        """Calculate landmark list from hand landmarks"""
        image_width, image_height = image.shape[1], image.shape[0]
        landmark_point = []
        
        for _, landmark in enumerate(landmarks.landmark):
            landmark_x = min(int(landmark.x * image_width), image_width - 1)
            landmark_y = min(int(landmark.y * image_height), image_height - 1)
            landmark_point.append([landmark_x, landmark_y])
        
        return landmark_point

    def pre_process_landmark(self, landmark_list):
        """Pre-process landmarks for model input"""
        temp_landmark_list = copy.deepcopy(landmark_list)
        
        # Convert to relative coordinates
        base_x, base_y = 0, 0
        for index, landmark_point in enumerate(temp_landmark_list):
            if index == 0:
                base_x, base_y = landmark_point[0], landmark_point[1]
            
            temp_landmark_list[index][0] = temp_landmark_list[index][0] - base_x
            temp_landmark_list[index][1] = temp_landmark_list[index][1] - base_y
        
        # Convert to one-dimensional list
        temp_landmark_list = list(itertools.chain.from_iterable(temp_landmark_list))
        
        # Normalization
        max_value = max(list(map(abs, temp_landmark_list)))
        if max_value > 0:
            temp_landmark_list = [n / max_value for n in temp_landmark_list]
        
        return temp_landmark_list

    def detect_sign(self, image):
        """Detect ISL sign in the image"""
        try:
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.hands.process(image_rgb)
            
            if not results.multi_hand_landmarks:
                return None, 0.0, "No hand detected in image"
            
            # Use first detected hand
            hand_landmarks = results.multi_hand_landmarks[0]
            
            # Extract and process landmarks
            landmark_list = self.calc_landmark_list(image, hand_landmarks)
            processed_landmarks = self.pre_process_landmark(landmark_list)
            
            # Prepare data for prediction
            df = pd.DataFrame(processed_landmarks).transpose()
            
            # Get prediction
            predictions = self.model.predict(df, verbose=0)[0]
            predicted_class = np.argmax(predictions)
            confidence = predictions[predicted_class]
            predicted_label = self.alphabet[predicted_class]
            
            return predicted_label, float(confidence), "Sign detected successfully"
            
        except Exception as e:
            return None, 0.0, f"Detection error: {str(e)}"

    def verify_sign(self, image, expected_sign):
        """Verify if detected sign matches expected sign"""
        try:
            # Basic image validation
            if image is None:
                return {
                    'is_correct': False,
                    'confidence': 0.0,
                    'error': 'Invalid image'
                }
            
            height, width = image.shape[:2]
            if height < 100 or width < 100:
                return {
                    'is_correct': False,
                    'confidence': 0.0,
                    'error': 'Image too small for processing'
                }
            
            # Detect sign
            detected_sign, confidence, message = self.detect_sign(image)
            
            if detected_sign is None:
                return {
                    'is_correct': False,
                    'confidence': 0.0,
                    'expected_sign': expected_sign,
                    'detected_sign': 'none',
                    'error': message
                }
            
            # Check if detected sign matches expected
            expected_upper = expected_sign.upper()
            is_correct = detected_sign == expected_upper
            
            # Apply confidence threshold
            min_confidence = 0.6
            if confidence < min_confidence:
                is_correct = False
                message = f"Low confidence detection ({confidence:.1%})"
            
            return {
                'is_correct': is_correct,
                'confidence': float(confidence),
                'expected_sign': expected_sign,
                'detected_sign': detected_sign,
                'message': f'Detected "{detected_sign}" with {confidence:.1%} confidence. {"✅ Correct!" if is_correct else "❌ Expected: " + expected_upper}'
            }
            
        except Exception as e:
            return {
                'is_correct': False,
                'confidence': 0.0,
                'error': f'Verification failed: {str(e)}'
            }

def main():
    """Main function to handle API requests"""
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: python api_isl_detection.py <base64_image> <expected_sign>")
        
        base64_image = sys.argv[1]
        expected_sign = sys.argv[2]
        
        # Initialize detector
        detector = APIISLDetector()
        
        # Decode the image
        image = detector.decode_base64_image(base64_image)
        
        if image is None:
            raise ValueError("Failed to decode image")
        
        # Verify the sign
        result = detector.verify_sign(image, expected_sign)
        
        # Output JSON result
        print(json.dumps(result))
        
    except Exception as e:
        # Output error as JSON
        error_result = {
            'is_correct': False,
            'confidence': 0.0,
            'error': str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()