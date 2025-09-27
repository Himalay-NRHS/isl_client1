import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface GLBViewerProps {
  words?: string;
  onAnimationComplete?: () => void;
}

interface AnimatedModelProps {
  url: string;
  visible: boolean;
  onFinished?: () => void;
}

// Preload models
useGLTF.preload("/models/child.glb");
useGLTF.preload("/models/cat.glb");
useGLTF.preload("/models/birds.glb");

function AnimatedModel({ url, visible, onFinished }: AnimatedModelProps) {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (visible && animations.length && actions) {
      const action = actions[animations[0].name];
      if (action) {
        action.reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();

        const onEnd = () => onFinished?.();
        mixer.addEventListener("finished", onEnd);

        return () => mixer.removeEventListener("finished", onEnd);
      }
    }
  }, [visible, animations, actions, mixer, onFinished]);

  // Adjust model position and scaling for better framing
  useEffect(() => {
    if (scene) {
      // Calculate the bounding box to properly center and scale
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const height = size.y;
      const width = size.x;
      
      // Adjust vertical position based on model height
      if (url.includes('child.glb') || url.includes('father.glb') || url.includes('Girl.glb')) {
        // Human models might need different positioning
        scene.position.y = -height/3;
      } else if (url.includes('cat.glb') || url.includes('dog.glb') || url.includes('birds.glb')) {
        // Animal models might need different positioning
        scene.position.y = -height/5;
      } else {
        // Default positioning for other models
        scene.position.y = -height/4;
      }
      
      // Apply different scaling based on model width
      // This ensures models don't appear too large or too small
      if (width > 1.5) {
        scene.scale.set(0.9, 0.9, 0.9); // Scale down wide models
      } else if (width < 0.5) {
        scene.scale.set(1.4, 1.4, 1.4); // Scale up narrow models
      }
    }
  }, [scene, url]);

  return (
    <primitive
      ref={group}
      object={scene}
      position={[0, -0.3, 0]} // Base position adjustment
      scale={1.2} // Base scale, further adjusted by useEffect if needed
      rotation={[0, 0, 0]} // Ensure model is facing forward
      visible={visible}
    />
  );
}

// Loading spinner component
const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function GLBViewer({ words = '', onAnimationComplete }: GLBViewerProps) {
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([
    '/models/child.glb', 
    '/models/cat.glb', 
    '/models/birds.glb'
  ]);

  useEffect(() => {
    if (words.trim()) {
      setIsLoading(true);
      const wordArray = words.trim().toLowerCase().split(' ').filter(word => word.length > 0);
      const modelPaths = wordArray.map(word => `/models/${word}.glb`);
      setModels(modelPaths);
      setCurrentModelIndex(0);
      setIsAnimating(false);
      // Simulate loading time for models
      setTimeout(() => setIsLoading(false), 800);
    } else {
      setIsLoading(true);
      setModels(['/models/child.glb', '/models/cat.glb', '/models/birds.glb']);
      setCurrentModelIndex(0);
      setIsAnimating(false);
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [words]);

  useEffect(() => {
    if (models.length > 0 && !isAnimating && currentModelIndex === 0) {
      const timer = setTimeout(() => {
        setCurrentModelIndex(0);
        setIsAnimating(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [models]);

  const handleFinished = () => {
    if (currentModelIndex < models.length - 1) {
      setTimeout(() => {
        setCurrentModelIndex(prev => prev + 1);
      }, 1000);
    } else {
      setIsAnimating(false);
      onAnimationComplete?.();
    }
  };

  const startAnimation = () => {
    if (models.length > 0) {
      setCurrentModelIndex(0);
      setIsAnimating(true);
    }
  };

  const restartAnimation = () => {
    setCurrentModelIndex(0);
    setIsAnimating(true);
  };

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="w-full flex-grow min-h-[300px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
        {isLoading && <LoadingSpinner />}
        
        <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} shadows camera={{ position: [0, 0.7, 1.8], fov: 40 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 5]} intensity={1.2} castShadow />
          <pointLight position={[-2, 2, -2]} intensity={0.5} />
          <hemisphereLight intensity={0.4} groundColor="black" />

          <Suspense fallback={null}>
            {models.map((modelUrl, i) => (
              <AnimatedModel
                key={modelUrl}
                url={modelUrl}
                visible={i === currentModelIndex && isAnimating && !isLoading}
                onFinished={handleFinished}
              />
            ))}
          </Suspense>

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={1.5}
            maxDistance={4}
            target={[0, 0.4, 0]} // Focus on upper body/face area
            makeDefault
          />
        </Canvas>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
          {isLoading ? (
            <span>Loading models...</span>
          ) : models.length > 0 ? (
            <span>
              {currentModelIndex + 1} / {models.length}
              {isAnimating && (
                <span> - Playing: {models[currentModelIndex]?.split('/').pop()?.replace('.glb', '')}</span>
              )}
            </span>
          ) : (
            <span>No models to display</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={startAnimation}
            disabled={isAnimating || models.length === 0 || isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            {isLoading ? 'Loading...' : isAnimating ? 'Playing...' : 'Play Sequence'}
          </button>
          <button
            onClick={restartAnimation}
            disabled={models.length === 0 || isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}