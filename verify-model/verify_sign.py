#!/usr/bin/env python3
"""
ISL Sign Verification API Wrapper
This script serves as a bridge between the Node.js backend and the ISL detection model.
"""

import sys
import json
import base64
import cv2
import numpy as np
import os
from pathlib import Path

def decode_base64_image(base64_string):
    """
    Decode base64 image string to OpenCV image
    """
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

def verify_sign(image, expected_sign):
    """
    Verify if the sign in the image matches the expected sign
    This is a placeholder function - integrate with your actual ISL model here
    """
    try:
        # Placeholder verification logic
        # In production, this would use your trained ISL model
        
        # For demo purposes, simulate processing
        height, width = image.shape[:2]
        
        # Basic image validation
        if height < 100 or width < 100:
            return {
                'is_correct': False,
                'confidence': 0.0,
                'error': 'Image too small for processing'
            }
        
        # Simulate model prediction
        # In production, replace this with actual model inference
        import random
        confidence = random.uniform(0.6, 0.95)
        is_correct = confidence > 0.7  # Confidence threshold
        
        return {
            'is_correct': is_correct,
            'confidence': confidence,
            'expected_sign': expected_sign,
            'detected_sign': expected_sign if is_correct else 'unknown',
            'message': f'Sign {"recognized" if is_correct else "not recognized"} with {confidence:.1%} confidence'
        }
        
    except Exception as e:
        return {
            'is_correct': False,
            'confidence': 0.0,
            'error': f'Verification failed: {str(e)}'
        }

def main():
    """
    Main function to handle command line arguments and process verification
    """
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: python verify_sign.py <base64_image> <expected_sign>")
        
        base64_image = sys.argv[1]
        expected_sign = sys.argv[2]
        
        # Decode the image
        image = decode_base64_image(base64_image)
        
        if image is None:
            raise ValueError("Failed to decode image")
        
        # Verify the sign
        result = verify_sign(image, expected_sign)
        
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