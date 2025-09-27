#!/usr/bin/env python3
"""
Stable ISL Detection System
Improved version with prediction smoothing, confidence filtering, and better UI
"""

import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import string
from tensorflow import keras
from collections import deque, Counter
import time
import copy
import itertools

class StableISLDetector:
    def __init__(self, model_path="model.h5"):
        """Initialize the stable ISL detector"""
        print("🚀 Initializing Stable ISL Detection System...")
        
        # Load model
        try:
            import os
            if not os.path.exists(model_path):
                # Try to find model in current directory
                current_dir = os.path.dirname(os.path.abspath(__file__))
                alt_path = os.path.join(current_dir, model_path)
                if os.path.exists(alt_path):
                    model_path = alt_path
                else:
                    print(f"❌ Model file not found: {model_path}")
                    print(f"Current directory: {current_dir}")
                    print(f"Available files: {os.listdir(current_dir)}")
                    exit(1)
            
            self.model = keras.models.load_model(model_path)
            print(f"✅ Model loaded: {model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            exit(1)
        
        # Define alphabet (matching original training order)
        self.alphabet = ['1','2','3','4','5','6','7','8','9']
        self.alphabet += list(string.ascii_uppercase)
        print(f"📋 Classes: {len(self.alphabet)} - {self.alphabet}")
        
        # Initialize MediaPipe
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.hands = self.mp_hands.Hands(
            model_complexity=0,
            max_num_hands=1,  # Focus on single hand for stability
            min_detection_confidence=0.7,  # Higher threshold
            min_tracking_confidence=0.7
        )
        
        # Prediction smoothing
        self.prediction_buffer = deque(maxlen=10)  # Store last 10 predictions
        self.confidence_buffer = deque(maxlen=10)
        self.min_confidence = 0.6  # Minimum confidence threshold
        self.stability_threshold = 0.7  # Require 70% agreement for stable prediction
        
        # Word formation
        self.current_word = []
        self.last_stable_prediction = None
        self.last_prediction_time = time.time()
        self.hold_duration = 1.5  # Hold time to add letter to word
        self.pause_duration = 3.0  # Pause to complete word
        
        # UI state
        self.show_debug = False
        self.fps_counter = deque(maxlen=30)
        
        print("🎉 System ready!")
        print("\n📋 Controls:")
        print("   SPACE - Add current letter to word")
        print("   ENTER - Complete word and start new")
        print("   'c' - Clear current word")
        print("   'd' - Toggle debug info")
        print("   'q' - Quit")

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

    def predict_stable(self, landmarks):
        """Make stable prediction with confidence filtering"""
        if landmarks is None:
            return None, 0.0
        
        try:
            # Prepare data for prediction
            df = pd.DataFrame(landmarks).transpose()
            
            # Get prediction
            predictions = self.model.predict(df, verbose=0)[0]
            predicted_class = np.argmax(predictions)
            confidence = predictions[predicted_class]
            predicted_label = self.alphabet[predicted_class]
            
            # Add to buffers
            self.prediction_buffer.append(predicted_label)
            self.confidence_buffer.append(confidence)
            
            # Check if we have enough data for stability check
            if len(self.prediction_buffer) < 5:
                return None, 0.0
            
            # Get recent predictions
            recent_predictions = list(self.prediction_buffer)[-5:]
            recent_confidences = list(self.confidence_buffer)[-5:]
            
            # Check for stability (majority agreement)
            prediction_counts = Counter(recent_predictions)
            most_common = prediction_counts.most_common(1)[0]
            
            # Calculate stability ratio
            stability_ratio = most_common[1] / len(recent_predictions)
            avg_confidence = np.mean([c for p, c in zip(recent_predictions, recent_confidences) 
                                    if p == most_common[0]])
            
            # Return stable prediction if meets thresholds
            if (stability_ratio >= self.stability_threshold and 
                avg_confidence >= self.min_confidence):
                return most_common[0], avg_confidence
            
            return None, 0.0
            
        except Exception as e:
            print(f"⚠️ Prediction error: {e}")
            return None, 0.0

    def update_word(self, prediction, confidence):
        """Update word formation logic"""
        current_time = time.time()
        
        if prediction and confidence > self.min_confidence:
            # Check if this is a new stable prediction
            if self.last_stable_prediction != prediction:
                self.last_stable_prediction = prediction
                self.last_prediction_time = current_time
                return False
            else:
                # Same prediction held - check duration
                hold_time = current_time - self.last_prediction_time
                if hold_time >= self.hold_duration:
                    # Add to word if not already the last letter
                    if not self.current_word or self.current_word[-1] != prediction:
                        self.current_word.append(prediction)
                        print(f"➕ Added '{prediction}' → {''.join(self.current_word)}")
                    self.last_prediction_time = current_time
                    return False
        else:
            # No stable prediction - check for word completion
            if (self.current_word and 
                current_time - self.last_prediction_time > self.pause_duration):
                word = ''.join(self.current_word)
                print(f"✅ Word completed: '{word}'")
                self.current_word = []
                self.last_stable_prediction = None
                return True
        
        return False

    def draw_ui(self, frame, prediction, confidence):
        """Draw enhanced UI on frame"""
        height, width = frame.shape[:2]
        
        # Create semi-transparent overlay
        overlay = frame.copy()
        
        # Main prediction box
        main_box_h = 120
        if prediction and confidence > self.min_confidence:
            # Stable prediction found
            color = (0, 150, 0) if confidence > 0.8 else (0, 100, 150)
            
            cv2.rectangle(overlay, (20, 20), (300, 20 + main_box_h), color, -1)
            cv2.rectangle(frame, (20, 20), (300, 20 + main_box_h), (0, 255, 0), 3)
            
            # Prediction text
            cv2.putText(frame, prediction, (40, 80), cv2.FONT_HERSHEY_SIMPLEX, 
                       2.5, (255, 255, 255), 4)
            
            # Confidence bar
            conf_width = int(260 * confidence)
            cv2.rectangle(frame, (40, 100), (40 + conf_width, 120), (255, 255, 255), -1)
            cv2.putText(frame, f"{confidence:.1%}", (200, 115), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.6, (255, 255, 255), 2)
        else:
            # No stable prediction
            cv2.rectangle(overlay, (20, 20), (300, 20 + main_box_h), (50, 50, 50), -1)
            cv2.rectangle(frame, (20, 20), (300, 20 + main_box_h), (100, 100, 100), 3)
            cv2.putText(frame, "Detecting...", (40, 80), cv2.FONT_HERSHEY_SIMPLEX, 
                       1.2, (200, 200, 200), 2)
        
        # Word display
        word_text = ''.join(self.current_word) if self.current_word else "..."
        word_box_w = max(300, len(word_text) * 20 + 40)
        word_y = height - 100
        
        cv2.rectangle(overlay, (20, word_y), (20 + word_box_w, word_y + 60), (30, 30, 30), -1)
        cv2.rectangle(frame, (20, word_y), (20 + word_box_w, word_y + 60), (255, 255, 255), 2)
        
        cv2.putText(frame, "Word:", (30, word_y + 25), cv2.FONT_HERSHEY_SIMPLEX, 
                   0.7, (255, 255, 255), 2)
        cv2.putText(frame, word_text, (30, word_y + 50), cv2.FONT_HERSHEY_SIMPLEX, 
                   1, (0, 255, 255), 2)
        
        # Status indicators
        status_y = 160
        
        # Buffer status
        buffer_status = f"Buffer: {len(self.prediction_buffer)}/10"
        cv2.putText(frame, buffer_status, (width - 200, status_y), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Stability indicator
        if len(self.prediction_buffer) >= 5:
            recent = list(self.prediction_buffer)[-5:]
            stability = Counter(recent).most_common(1)[0][1] / 5
            stability_text = f"Stability: {stability:.1%}"
            stability_color = (0, 255, 0) if stability >= 0.7 else (0, 100, 255)
            cv2.putText(frame, stability_text, (width - 200, status_y + 20), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, stability_color, 1)
        
        # FPS
        self.fps_counter.append(time.time())
        if len(self.fps_counter) > 1:
            fps = len(self.fps_counter) / (self.fps_counter[-1] - self.fps_counter[0])
            cv2.putText(frame, f"FPS: {fps:.1f}", (width - 200, status_y + 40), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Controls
        controls_y = height - 140
        controls = [
            "SPACE: Add letter",
            "ENTER: Complete word",
            "C: Clear  D: Debug  Q: Quit"
        ]
        
        for i, control in enumerate(controls):
            cv2.putText(frame, control, (width - 250, controls_y + i * 15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (180, 180, 180), 1)
        
        # Debug info
        if self.show_debug and len(self.prediction_buffer) > 0:
            debug_y = 200
            recent_preds = list(self.prediction_buffer)[-3:]
            debug_text = f"Recent: {' '.join(recent_preds)}"
            cv2.putText(frame, debug_text, (20, debug_y), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (100, 255, 100), 1)
        
        # Blend overlay
        cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)
        
        return frame

    def run(self):
        """Main detection loop"""
        print("\n🎬 Starting camera...")
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Error: Could not open camera")
            return
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        print("📹 Camera ready! Starting stable detection...")
        
        try:
            while cap.isOpened():
                success, image = cap.read()
                if not success:
                    print("❌ Failed to read camera frame")
                    continue
                
                # Flip for mirror effect
                image = cv2.flip(image, 1)
                
                # Process with MediaPipe
                image.flags.writeable = False
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                results = self.hands.process(image_rgb)
                
                # Convert back
                image.flags.writeable = True
                
                # Initialize prediction variables
                prediction = None
                confidence = 0.0
                
                # Process hand landmarks
                if results.multi_hand_landmarks:
                    hand_landmarks = results.multi_hand_landmarks[0]  # Use first hand
                    
                    # Draw landmarks
                    self.mp_drawing.draw_landmarks(
                        image, hand_landmarks, self.mp_hands.HAND_CONNECTIONS,
                        self.mp_drawing_styles.get_default_hand_landmarks_style(),
                        self.mp_drawing_styles.get_default_hand_connections_style()
                    )
                    
                    # Extract and process landmarks
                    landmark_list = self.calc_landmark_list(image, hand_landmarks)
                    processed_landmarks = self.pre_process_landmark(landmark_list)
                    
                    # Get stable prediction
                    prediction, confidence = self.predict_stable(processed_landmarks)
                
                # Update word formation
                word_completed = self.update_word(prediction, confidence)
                
                # Draw UI
                image = self.draw_ui(image, prediction, confidence)
                
                # Display
                cv2.imshow('Stable ISL Detection', image)
                
                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    break
                elif key == ord(' '):  # Space - add letter
                    if prediction and confidence > self.min_confidence:
                        if not self.current_word or self.current_word[-1] != prediction:
                            self.current_word.append(prediction)
                            print(f"➕ Manual add: '{prediction}' → {''.join(self.current_word)}")
                elif key == 13:  # Enter - complete word
                    if self.current_word:
                        word = ''.join(self.current_word)
                        print(f"✅ Word completed: '{word}'")
                        self.current_word = []
                        self.last_stable_prediction = None
                elif key == ord('c'):  # Clear
                    self.current_word = []
                    self.last_stable_prediction = None
                    print("🗑️  Word cleared")
                elif key == ord('d'):  # Toggle debug
                    self.show_debug = not self.show_debug
                    print(f"🐛 Debug mode: {'ON' if self.show_debug else 'OFF'}")
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping detection...")
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
            print("👋 Detection stopped!")


def main():
    """Main function"""
    print("🌟 Stable ISL Detection System")
    print("===============================")
    
    detector = StableISLDetector()
    detector.run()


if __name__ == "__main__":
    main()