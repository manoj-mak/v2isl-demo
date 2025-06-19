import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';

const MODEL_PATH = '/models/combined-new.glb';

function ISL3DModel({ word, isIdle, onModelReady }) {
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, names } = useAnimations(animations, scene);
  const activeActionRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the model and start idle animation
  useEffect(() => {
    if (actions && names.length && !isInitialized) {
      // console.log('Available animations:', names);
      
      // Check if idle animation exists
      const idleAction = actions['idle'];
      if (idleAction) {
        // Stop all current actions first
        Object.values(actions).forEach(action => {
          if (action.isRunning()) {
            action.stop();
          }
        });
        
        // Start idle animation immediately
        idleAction.setLoop(2, Infinity);
        idleAction.reset().play();
        activeActionRef.current = 'idle';
        
        setIsInitialized(true);
        if (onModelReady) {
          onModelReady();
        }
      } else {
        console.warn('Idle animation not found in model');
        if (onModelReady) {
          onModelReady();
        }
      }
    }
  }, [actions, names, isInitialized, onModelReady]);

  // Handle animation changes
  useEffect(() => {
    if (!actions || !names.length || !isInitialized) return;

    const actionToPlay = isIdle || !word || !names.includes(word) ? 'idle' : word;
    const newAction = actions[actionToPlay];
    
    if (!newAction) {
      console.warn(`Animation "${actionToPlay}" not found`);
      return;
    }

    const currentAction = activeActionRef.current ? actions[activeActionRef.current] : null;
    
    // Only change animation if it's different from current
    if (newAction !== currentAction) {
      // Fade out current animation
      if (currentAction && currentAction.isRunning()) {
        currentAction.fadeOut(0.3);
      }
      
      // Configure and start new animation
      if (actionToPlay === 'idle') {
        newAction.setLoop(2, Infinity);
      } else {
        newAction.setLoop(2, 1);
        newAction.clampWhenFinished = true;
      }
      
      newAction.reset().fadeIn(0.3).play();
      activeActionRef.current = actionToPlay;
    }
  }, [word, isIdle, actions, names, isInitialized]);

  return (
    <primitive object={scene} scale={2.8} position={[0, -4.5, 0]} rotation={[-0.2, 0, 0]} />
  );
}

useGLTF.preload(MODEL_PATH);

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [islWords, setIslWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.7);
  const [lastPlayedWords, setLastPlayedWords] = useState([]);
  const [isIdle, setIsIdle] = useState(true); // Start with idle true
  const [modelReady, setModelReady] = useState(false);

  const recognitionRef = useRef(null);
  const playbackTimeoutRef = useRef(null);

  const parseToISL = (englishText) => {
    const text = englishText.toLowerCase().trim();
    const islRules = {
      'how are you': 'how you',
      'what are you doing': 'what you do',
      'where are you going': 'where you go',
      'why are you': 'why you',
      'what time is it': 'time what',
      'good morning': 'morning good',
      'good evening': 'evening good',
      'thank you': 'thank',
      'please help me': 'help please',
    };
    let islText = ` ${text} `;
    Object.entries(islRules).forEach(([english, isl]) => {
      islText = islText.replace(` ${english} `, ` ${isl} `);
    });
    islText = islText.replace(/ a | an | the | is | am | are | of /g, ' ');
    return islText.replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean);
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscribedText(transcript);
        const newIslWords = parseToISL(transcript);
        setIslWords(newIslWords);
        setLastPlayedWords(newIslWords);
        if (newIslWords.length > 0) {
          setTimeout(() => playSignSequence(newIslWords), 100);
        }
      };
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isPlaying) {
      setIsRecording(true);
      setTranscribedText('');
      setIslWords([]);
      setCurrentWordIndex(-1);
      setIsIdle(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const playSignSequence = async (wordsToPlay = islWords) => {
    if (wordsToPlay.length === 0 || isPlaying) return;
    
    setIsPlaying(true);
    setIsIdle(false); // Ensure we're not in idle mode during playback
    
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }
    
    for (let i = 0; i < wordsToPlay.length; i++) {
      setCurrentWordIndex(i);
      await new Promise(resolve => {
        const duration = 1500;
        playbackTimeoutRef.current = setTimeout(resolve, duration / playbackSpeed);
      });
    }
    
    // Return to idle state after playback
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setIsIdle(true);
  };

  const replaySequence = () => {
    if (lastPlayedWords.length > 0 && !isPlaying) {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      setCurrentWordIndex(-1);
      setIsIdle(true);
      setTimeout(() => {
        playSignSequence(lastPlayedWords);
      }, 50);
    }
  };

  const handleModelReady = () => {
    console.log('Model is ready and idle animation started');
    setModelReady(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-light text-gray-800 mb-2">
            Voice to Indian Sign Language
          </h1>
          <div className="w-20 h-0.5 bg-blue-500 mx-auto"></div>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <section className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Voice Input</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  disabled={isPlaying}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
                {lastPlayedWords.length > 0 && (
                  <button
                    onClick={replaySequence}
                    className="px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={isPlaying || isRecording}
                  >
                    <RotateCcw size={20} />
                    <span>Replay</span>
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Settings</h2>
              <div>
                <label htmlFor="playbackSpeed" className="block text-sm font-medium text-gray-600 mb-2">
                  Playback Speed: {playbackSpeed.toFixed(1)}x
                </label>
                <input
                  id="playbackSpeed"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isPlaying}
                />
              </div>
            </div>
            <AnimatePresence>
            {transcribedText && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Transcribed Text</h3>
                    <p className="text-gray-700 leading-relaxed italic">"{transcribedText}"</p>
                </motion.div>
            )}
            </AnimatePresence>
            <AnimatePresence>
            {islWords.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">ISL Sequence</h3>
                    <div className="flex flex-wrap gap-2">
                        {islWords.map((word, index) => (
                        <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                            index === currentWordIndex
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {word}
                        </span>
                        ))}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
          </section>
          <aside className="flex items-start justify-center">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full max-w-lg sticky top-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                {!modelReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Loading 3D model...</span>
                  </div>
                )}
                <Canvas camera={{ position: [0, -0.5, 4.5], fov: 45 }} shadows>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
                  <directionalLight position={[-3, 2, 2]} intensity={1} />
                  <pointLight position={[0, -2, 3]} intensity={0.5} />
                  <ISL3DModel 
                    word={islWords[currentWordIndex]} 
                    isIdle={isIdle}
                    onModelReady={handleModelReady}
                  />
                  <OrbitControls 
                    target={[0, -1.2, 0]}
                    enablePan={false} 
                    enableZoom={true}
                    minDistance={3}
                    maxDistance={8}
                    enableRotate={true}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.8}
                    minAzimuthAngle={-Math.PI / 4}
                    maxAzimuthAngle={Math.PI / 4}
                    enableDamping={true}
                    dampingFactor={0.05}
                  />
                </Canvas>
              </div>
            </div>
          </aside>
        </main>
      </div>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          margin-top: -8px;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default App;