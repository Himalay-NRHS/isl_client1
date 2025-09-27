import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface GLBViewerProps {
  words?: string; // Backend response string like "cat child sorry"
  onAnimationComplete?: () => void;
}

export default function GLBViewer({ words = '', onAnimationComplete }: GLBViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert words string to model paths
  useEffect(() => {
    if (words.trim()) {
      const wordArray = words.trim().toLowerCase().split(' ').filter(word => word.length > 0);
      const modelPaths = wordArray.map(word => {
        // Handle different model naming conventions
        const baseWord = word.toLowerCase();
        return `/models/${baseWord}.glb`;
      });
      setModels(modelPaths);
      setCurrentModelIndex(0);
      setIsAnimating(false);
    } else {
      // Clear models if no words provided
      setModels([]);
      setCurrentModelIndex(0);
      setIsAnimating(false);
    }
  }, [words]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 3);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Update all mixers
      mixersRef.current.forEach(mixer => {
        if (mixer) {
          mixer.update(0.016); // ~60fps
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Load and play models sequentially
  useEffect(() => {
    if (!sceneRef.current || models.length === 0 || isAnimating) return;

    const loadAndPlayModel = async (modelPath: string, index: number) => {
      const loader = new GLTFLoader();
      setIsLoading(true);
      setError(null);
      
      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            modelPath,
            resolve,
            (progress) => {
              // Optional: handle loading progress
              console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
            },
            reject
          );
        });

        // Clear previous model
        const previousModels = sceneRef.current!.children.filter(child => 
          child.type === 'Group' && child.userData.isModel
        );
        previousModels.forEach(model => {
          sceneRef.current!.remove(model);
        });

        // Clear previous mixers
        mixersRef.current.forEach(mixer => mixer.stopAllAction());
        mixersRef.current = [];

        // Add new model
        const model = gltf.scene;
        model.userData.isModel = true;
        model.position.set(0, 0, 0);
        model.visible = true;
        sceneRef.current!.add(model);

        setIsLoading(false);

        // Setup animations
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixersRef.current.push(mixer);

          const action = mixer.clipAction(gltf.animations[0]);
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          
          // Listen for animation completion
          mixer.addEventListener('finished', () => {
            setTimeout(() => {
              if (index < models.length - 1) {
                setCurrentModelIndex(index + 1);
              } else {
                setIsAnimating(false);
                onAnimationComplete?.();
              }
            }, 500); // Small delay between animations
          });

          action.play();
        } else {
          // If no animation, just show for 2 seconds then move to next
          setTimeout(() => {
            if (index < models.length - 1) {
              setCurrentModelIndex(index + 1);
            } else {
              setIsAnimating(false);
              onAnimationComplete?.();
            }
          }, 2000);
        }

      } catch (err) {
        const errorMessage = `Failed to load model: ${modelPath}`;
        console.error(errorMessage, err);
        setError(errorMessage);
        setIsLoading(false);
        
        // Move to next model even if current one fails
        setTimeout(() => {
          if (index < models.length - 1) {
            setCurrentModelIndex(index + 1);
          } else {
            setIsAnimating(false);
            onAnimationComplete?.();
          }
        }, 1000);
      }
    };

    if (currentModelIndex < models.length) {
      setIsAnimating(true);
      loadAndPlayModel(models[currentModelIndex], currentModelIndex);
    }
  }, [models, currentModelIndex, onAnimationComplete]);

  const startAnimation = () => {
    if (models.length > 0) {
      setCurrentModelIndex(0);
      setIsAnimating(false); // This will trigger the useEffect
    }
  };

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mountRef} 
        className="w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700"
        style={{ minHeight: '300px' }}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-xl">
          <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium text-gray-700">Loading model...</span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-red-50 bg-opacity-90 flex items-center justify-center rounded-xl">
          <div className="bg-white rounded-lg p-4 max-w-sm text-center">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <p className="text-sm text-gray-700">{error}</p>
          </div>
        </div>
      )}

      {/* Animation Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
          {models.length > 0 ? (
            <span>
              {currentModelIndex + 1} / {models.length}
              {isAnimating && ' - Playing...'}
            </span>
          ) : (
            <span>No models to display</span>
          )}
        </div>
        
        <button
          onClick={startAnimation}
          disabled={isAnimating || models.length === 0 || isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          {isAnimating ? 'Playing...' : isLoading ? 'Loading...' : 'Play Signs'}
        </button>
      </div>
    </div>
  );
}