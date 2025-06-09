
import { useState, useEffect, useCallback } from 'react';
import { GameGrid } from '@/components/GameGrid';
import { GameKeyboard } from '@/components/GameKeyboard';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { GameSummary } from '@/components/GameSummary';
import { PowerUpBlob } from '@/components/PowerUpBlob';
import { ContextSwitchPopup } from '@/components/ContextSwitchPopup';

const WORD_LIST = ['FOCUS', 'BRAIN', 'CHAOS', 'SPARK', 'DRIFT', 'STORM', 'PEACE', 'BURST', 'GLOW', 'RUSH'];
const GAME_DURATION = 300; // 5 minutes
const SYMPTOMS_START_TIME = 20; // Start symptoms after 20 seconds

export interface ADHDSettings {
  intensity: number;
  isAccommodated: boolean;
  isGoodBrainDay: boolean;
  isHyperfocus: boolean;
}

export interface GameState {
  guesses: string[];
  currentGuess: string;
  isGameOver: boolean;
  isWinner: boolean;
  targetWord: string;
  currentRow: number;
}

const Index = () => {
  
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    isGameOver: false,
    isWinner: false,
    targetWord: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)],
    currentRow: 0
  });

  const [adhdSettings, setADHDSettings] = useState<ADHDSettings>({
    intensity: 3,
    isAccommodated: false,
    isGoodBrainDay: false,
    isHyperfocus: false
  });

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [symptomsActive, setSymptomsActive] = useState(false);
  
  // ADHD Symptoms with improved timing
  const [keyboardFrozen, setKeyboardFrozen] = useState(false);
  const [letterScrambling, setLetterScrambling] = useState(false);
  const [colorBlindness, setColorBlindness] = useState(false);
  const [hyperfocusMode, setHyperfocusMode] = useState(false);
  const [contextSwitchActive, setContextSwitchActive] = useState(false);
  const [lastSymptomTime, setLastSymptomTime] = useState(0);
  
  // Power-ups
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [powerUpVisible, setPowerUpVisible] = useState(false);
  const [powerUpType, setPowerUpType] = useState<string>('');
  const [timeMultiplier, setTimeMultiplier] = useState(1);

  const timeRemaining = Math.max(0, GAME_DURATION - timeElapsed);

  // Main game timer
  useEffect(() => {
    if (!gameActive || gameState.isGameOver) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + timeMultiplier;
        
        // Activate symptoms after SYMPTOMS_START_TIME
        if (newTime >= SYMPTOMS_START_TIME && !symptomsActive) {
          setSymptomsActive(true);
          console.log('🧠 Symptoms activated at time:', newTime);
        }
        
        if (newTime >= GAME_DURATION) {
          setGameActive(false);
          setGameState(prevState => ({
            ...prevState,
            isGameOver: true
          }));
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, gameState.isGameOver, timeMultiplier, symptomsActive]);

  // ADHD Symptoms - Improved timing with intensity-based frequency
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || !symptomsActive) return;
    
    // Don't trigger symptoms if remove_distraction power-up is active
    if (activePowerUp === 'remove_distraction') return;
    
    console.log('🧠 Starting ADHD symptoms system with intensity:', adhdSettings.intensity);

    // Calculate symptom frequency based on intensity (1-5 scale)
    const baseInterval = 8000; // 8 seconds base
    const intensityMultiplier = Math.max(0.3, 1.1 - (adhdSettings.intensity * 0.2)); // Higher intensity = more frequent
    const symptomCheckInterval = baseInterval * intensityMultiplier;
    
    console.log('🎯 Symptom check interval:', symptomCheckInterval, 'ms');

    const symptomInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastSymptom = currentTime - lastSymptomTime;
      
      // Minimum cooldown based on intensity (higher intensity = shorter cooldown)
      const minCooldown = Math.max(5000, 12000 - (adhdSettings.intensity * 1500));
      
      if (timeSinceLastSymptom < minCooldown) {
        console.log('⏳ Symptom on cooldown, skipping...');
        return;
      }
      
      // Check if any major symptom is currently active
      const majorSymptomActive = keyboardFrozen || letterScrambling || colorBlindness;
      
      const random = Math.random();
      console.log('🎲 Symptom check:', random);
      
      // Intensity-based trigger chance (20% base + intensity bonus)
      const triggerChance = 0.15 + (adhdSettings.intensity * 0.05); // 20% to 40% based on intensity
      
      if (random < triggerChance) {
        const symptomRoll = Math.random();
        console.log('🎯 Symptom type roll:', symptomRoll);
        
        setLastSymptomTime(currentTime);
        
        // Balanced frequencies - equal 25% chance for each symptom type
        if (symptomRoll < 0.25 && !majorSymptomActive) {
          console.log('🔒 TRIGGERING: Keyboard freeze');
          setKeyboardFrozen(true);
          setTimeout(() => {
            setKeyboardFrozen(false);
            console.log('🔓 Keyboard unfrozen');
          }, 3000); // 3 seconds duration
        }
        else if (symptomRoll < 0.5 && !majorSymptomActive) {
          console.log('🔀 TRIGGERING: Letter scrambling');
          setLetterScrambling(true);
          setTimeout(() => {
            setLetterScrambling(false);
            console.log('✅ Letter scrambling stopped');
          }, 4000); // 4 seconds duration
        }
        else if (symptomRoll < 0.75 && !majorSymptomActive) {
          console.log('👁️ TRIGGERING: Color blindness');
          setColorBlindness(true);
          setTimeout(() => {
            setColorBlindness(false);
            console.log('🌈 Colors restored');
          }, 5000); // 5 seconds duration
        }
        else if (symptomRoll < 1.0) {
          // Context switch can overlap with other symptoms
          console.log('🎪 TRIGGERING: Context switch');
          setContextSwitchActive(true);
          // Context switch will be cleared by the popup component
        }
      }
    }, symptomCheckInterval);

    return () => {
      console.log('🧹 Cleaning up symptoms interval');
      clearInterval(symptomInterval);
    };
  }, [gameActive, gameState.isGameOver, symptomsActive, activePowerUp, keyboardFrozen, letterScrambling, colorBlindness, lastSymptomTime, adhdSettings.intensity]);

  // Hyperfocus effect - Fixed
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || !symptomsActive) return;
    if (activePowerUp === 'remove_distraction') return;

    const hyperfocusInterval = setInterval(() => {
      if (Math.random() < 0.12 && !hyperfocusMode) { // Reduced to 12% chance
        console.log('🎯 TRIGGERING: Hyperfocus mode');
        setHyperfocusMode(true);
        setTimeout(() => {
          setHyperfocusMode(false);
          console.log('🎯 Hyperfocus deactivated');
        }, 8000);
      }
    }, 15000); // Check every 15 seconds (increased from 12)

    return () => clearInterval(hyperfocusInterval);
  }, [gameActive, gameState.isGameOver, symptomsActive, hyperfocusMode, activePowerUp]);

  // Power-up spawning - Fixed timing
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || powerUpVisible || !symptomsActive) return;

    console.log('💡 Starting power-up spawning system');

    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.3) { // Reduced to 30% chance
        const powerUpTypes = ['slow_time', 'reveal_letters', 'remove_distraction', 'focus_mode'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        setPowerUpType(randomType);
        setPowerUpVisible(true);
        console.log('💡 Power-up spawned:', randomType);
        
        setTimeout(() => {
          setPowerUpVisible(false);
          console.log('💡 Power-up disappeared');
        }, 12000); // 12 seconds visibility (increased from 10)
      }
    }, 10000); // Check every 10 seconds (increased from 8)

    return () => {
      console.log('🧹 Cleaning up power-up interval');
      clearInterval(spawnInterval);
    };
  }, [gameActive, gameState.isGameOver, powerUpVisible, symptomsActive]);

  const handlePowerUpClick = (type: string) => {
    setActivePowerUp(type);
    setPowerUpVisible(false);
    console.log('Power-up activated:', type);
    
    switch (type) {
      case 'slow_time':
        setTimeMultiplier(0.5); // Slow down time
        setTimeout(() => {
          setActivePowerUp(null);
          setTimeMultiplier(1); // Reset to normal speed
        }, 15000);
        break;
        
      case 'reveal_letters':
        setTimeout(() => setActivePowerUp(null), 12000);
        break;
        
      case 'remove_distraction':
        // Clear all active symptoms immediately
        setKeyboardFrozen(false);
        setLetterScrambling(false);
        setColorBlindness(false);
        setContextSwitchActive(false);
        setHyperfocusMode(false);
        // Reset the last symptom time to add extra cooldown
        setLastSymptomTime(Date.now() + 8000); // Add 8 seconds extra cooldown
        setTimeout(() => setActivePowerUp(null), 15000); // 15 seconds duration
        break;
        
      case 'focus_mode':
        setTimeout(() => setActivePowerUp(null), 10000);
        break;
    }
  };

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.isGameOver || keyboardFrozen || contextSwitchActive) return;
    
    if (key === 'ENTER') {
      if (gameState.currentGuess.length === 5) {
        const newGuesses = [...gameState.guesses, gameState.currentGuess];
        const isWinner = gameState.currentGuess === gameState.targetWord;
        const isGameOver = isWinner || newGuesses.length >= 6;
        
        setGameState(prev => ({
          ...prev,
          guesses: newGuesses,
          currentGuess: '',
          currentRow: prev.currentRow + 1,
          isGameOver,
          isWinner
        }));
        
        if (isGameOver) {
          setGameActive(false);
        }
      }
    } else if (key === 'BACKSPACE') {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1)
      }));
    } else if (key.length === 1 && gameState.currentGuess.length < 5) {
      let newGuess = gameState.currentGuess + key;
      
      // Letter scrambling effect
      if (letterScrambling && newGuess.length >= 2) {
        const chars = newGuess.split('');
        // Randomly swap some characters
        for (let i = 0; i < chars.length - 1; i++) {
          if (Math.random() < 0.4) {
            [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
          }
        }
        newGuess = chars.join('');
      }
      
      setGameState(prev => ({
        ...prev,
        currentGuess: newGuess
      }));
    }
  }, [gameState, keyboardFrozen, contextSwitchActive, letterScrambling]);

  const resetGame = () => {
    setGameState({
      guesses: [],
      currentGuess: '',
      isGameOver: false,
      isWinner: false,
      targetWord: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)],
      currentRow: 0
    });
    setTimeElapsed(0);
    setGameActive(true);
    setSymptomsActive(false);
    setKeyboardFrozen(false);
    setLetterScrambling(false);
    setColorBlindness(false);
    setHyperfocusMode(false);
    setContextSwitchActive(false);
    setActivePowerUp(null);
    setPowerUpVisible(false);
    setLastSymptomTime(0);
    setTimeMultiplier(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      hyperfocusMode 
        ? 'bg-black relative' 
        : activePowerUp === 'focus_mode' 
          ? 'bg-black' 
          : 'bg-background'
    }`}>
      {/* Hyperfocus overlay - Enhanced with 85% darkness but allowing current guess visibility */}
      {hyperfocusMode && (
        <div className="fixed inset-0 bg-black bg-opacity-85 z-10 pointer-events-none" />
      )}
      
      <div className={`container mx-auto max-w-lg p-4 ${hyperfocusMode ? 'relative z-20' : ''}`}>
        {/* Header */}
        <header className={`text-center py-4 border-b border-border ${
          activePowerUp === 'focus_mode' ? 'opacity-0' : 
          hyperfocusMode ? 'opacity-100' : ''
        } ${hyperfocusMode ? 'shadow-lg shadow-white/50 bg-background/20 backdrop-blur-sm rounded-lg border border-white/20' : ''}`}>
          <h1 className="text-2xl font-bold text-foreground">ADHD Wordle</h1>
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Time: {formatTime(timeElapsed)}</span>
            <span className={timeRemaining < 60 ? 'text-red-500 font-bold' : ''}>
              Remaining: {formatTime(timeRemaining)}
            </span>
            <span>Attempt: {gameState.currentRow + 1}/6</span>
          </div>
          {symptomsActive && (
            <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              🧠 ADHD Mode Active - Intensity: {adhdSettings.intensity}/5
            </div>
          )}
          {hyperfocusMode && (
            <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              🎯 Hyperfocus Mode - Everything else fades away!
            </div>
          )}
          {activePowerUp === 'remove_distraction' && (
            <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              🧘 Distraction-Free Mode Active
            </div>
          )}
          {activePowerUp === 'slow_time' && (
            <div className="mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              ⏰ Time Slowed Down!
            </div>
          )}
        </header>

        {/* Show game summary if game is over */}
        {gameState.isGameOver ? (
          <div className="py-4 space-y-4">
            <GameSummary 
              gameState={gameState}
              timeElapsed={timeElapsed}
              correctWord={gameState.targetWord}
            />
            
            <div className="text-center">
              <button
                onClick={resetGame}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Accessibility Controls */}
            <div className={
              activePowerUp === 'focus_mode' ? 'opacity-0' : 
              hyperfocusMode ? 'opacity-0' : ''
            }>
              <AccessibilityControls 
                settings={adhdSettings}
                onSettingsChange={setADHDSettings}
              />
            </div>

            {/* Main Game Area */}
            <div className={`py-4 space-y-4 ${hyperfocusMode ? 'shadow-lg shadow-white/50 bg-background/20 backdrop-blur-sm rounded-lg border border-white/20' : ''}`}>
              <GameGrid 
                gameState={gameState}
                colorBlindness={colorBlindness && activePowerUp !== 'remove_distraction'}
                hyperfocusMode={hyperfocusMode}
              />
              
              <GameKeyboard 
                onKeyPress={handleKeyPress}
                gameState={gameState}
                frozen={keyboardFrozen && activePowerUp !== 'remove_distraction'}
                revealLetters={activePowerUp === 'reveal_letters'}
                targetWord={gameState.targetWord}
              />
            </div>

            {/* Status indicators */}
            {keyboardFrozen && activePowerUp !== 'remove_distraction' && (
              <div className="text-center text-sm text-red-600 mt-2 font-bold bg-red-100 py-2 rounded">
                🔒 KEYBOARD FROZEN - Can't type right now!
              </div>
            )}

            {letterScrambling && activePowerUp !== 'remove_distraction' && (
              <div className="text-center text-sm text-yellow-600 mt-2 font-bold bg-yellow-100 py-2 rounded">
                🔀 LETTERS SCRAMBLING - Words getting mixed up!
              </div>
            )}

            {colorBlindness && activePowerUp !== 'remove_distraction' && (
              <div className="text-center text-sm text-purple-600 mt-2 font-bold bg-purple-100 py-2 rounded">
                👁️ COLORS DISRUPTED - Visual feedback affected!
              </div>
            )}
          </>
        )}

        {/* Power-up floating action button - Enhanced for mobile */}
        {powerUpVisible && (
          <PowerUpBlob 
            type={powerUpType}
            onClick={() => handlePowerUpClick(powerUpType)}
          />
        )}

        {/* Context switch popup */}
        {contextSwitchActive && activePowerUp !== 'remove_distraction' && (
          <ContextSwitchPopup 
            onComplete={() => setContextSwitchActive(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
