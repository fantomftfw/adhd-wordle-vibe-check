import { useState, useEffect, useCallback } from 'react';
import { GameGrid } from '@/components/GameGrid';
import { GameKeyboard } from '@/components/GameKeyboard';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { GameSummary } from '@/components/GameSummary';
import { PowerUpBlob } from '@/components/PowerUpBlob';
import { ContextSwitchPopup } from '@/components/ContextSwitchPopup';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
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

  const timeRemaining = Math.max(0, GAME_DURATION - timeElapsed);

  // Main game timer
  useEffect(() => {
    if (!gameActive || gameState.isGameOver) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + (hyperfocusMode ? 2 : 1);
        
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
          toast({
            title: "⏰ Time's up!",
            description: `The word was ${gameState.targetWord}`,
          });
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, gameState.isGameOver, hyperfocusMode, gameState.targetWord, toast, symptomsActive]);

  // ADHD Symptoms - Improved timing with cooldowns
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || !symptomsActive) return;
    
    // Don't trigger symptoms if remove_distraction power-up is active
    if (activePowerUp === 'remove_distraction') return;
    
    console.log('🧠 Starting ADHD symptoms system');

    const symptomInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastSymptom = currentTime - lastSymptomTime;
      
      // Minimum 8 seconds between symptoms (cooldown)
      if (timeSinceLastSymptom < 8000) {
        console.log('⏳ Symptom on cooldown, skipping...');
        return;
      }
      
      // Check if any symptom is currently active
      const anySymptomActive = keyboardFrozen || letterScrambling || colorBlindness || contextSwitchActive;
      if (anySymptomActive) {
        console.log('🚫 Symptom already active, skipping...');
        return;
      }
      
      const random = Math.random();
      console.log('🎲 Symptom check:', random);
      
      // Reduced chance for symptoms to trigger (30% instead of 90%)
      if (random < 0.3) {
        const symptomRoll = Math.random();
        console.log('🎯 Symptom type roll:', symptomRoll);
        
        setLastSymptomTime(currentTime);
        
        if (symptomRoll < 0.25) {
          console.log('🔒 TRIGGERING: Keyboard freeze');
          setKeyboardFrozen(true);
          toast({
            title: "🔒 Focus interrupted!",
            description: "Keyboard frozen for a moment...",
          });
          setTimeout(() => {
            setKeyboardFrozen(false);
            console.log('🔓 Keyboard unfrozen');
          }, 3000); // 3 seconds duration
        }
        else if (symptomRoll < 0.5) {
          console.log('🔀 TRIGGERING: Letter scrambling');
          setLetterScrambling(true);
          toast({
            title: "🔀 Letters scrambling!",
            description: "Words getting mixed up...",
          });
          setTimeout(() => {
            setLetterScrambling(false);
            console.log('✅ Letter scrambling stopped');
          }, 4000); // 4 seconds duration
        }
        else if (symptomRoll < 0.75) {
          console.log('👁️ TRIGGERING: Color blindness');
          setColorBlindness(true);
          toast({
            title: "👁️ Colors fading!",
            description: "Visual feedback disrupted...",
          });
          setTimeout(() => {
            setColorBlindness(false);
            console.log('🌈 Colors restored');
          }, 5000); // 5 seconds duration
        }
        else {
          console.log('🎪 TRIGGERING: Context switch');
          setContextSwitchActive(true);
          toast({
            title: "🎪 Context switch!",
            description: "Something else grabbed your attention...",
          });
          // Context switch will be cleared by the popup component
        }
      }
    }, 5000); // Check every 5 seconds (increased from 2 seconds)

    return () => {
      console.log('🧹 Cleaning up symptoms interval');
      clearInterval(symptomInterval);
    };
  }, [gameActive, gameState.isGameOver, symptomsActive, activePowerUp, toast, keyboardFrozen, letterScrambling, colorBlindness, contextSwitchActive, lastSymptomTime]);

  // Hyperfocus effect - Fixed
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || !symptomsActive) return;
    if (activePowerUp === 'remove_distraction') return;

    const hyperfocusInterval = setInterval(() => {
      if (Math.random() < 0.15 && !hyperfocusMode) { // Reduced chance (15% instead of 20%)
        console.log('🎯 TRIGGERING: Hyperfocus mode');
        setHyperfocusMode(true);
        toast({
          title: "🎯 Hyperfocus activated!",
          description: "All distractions cleared, but time moves faster!",
        });
        setTimeout(() => {
          setHyperfocusMode(false);
          console.log('🎯 Hyperfocus deactivated');
        }, 8000);
      }
    }, 12000); // Check every 12 seconds (increased from 4 seconds)

    return () => clearInterval(hyperfocusInterval);
  }, [gameActive, gameState.isGameOver, symptomsActive, hyperfocusMode, toast, activePowerUp]);

  // Power-up spawning - Fixed timing
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || powerUpVisible || !symptomsActive) return;

    console.log('💡 Starting power-up spawning system');

    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.4) { // Reduced chance (40% instead of 60%)
        const powerUpTypes = ['slow_time', 'reveal_letters', 'remove_distraction', 'focus_mode'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        setPowerUpType(randomType);
        setPowerUpVisible(true);
        console.log('💡 Power-up spawned:', randomType);
        
        toast({
          title: "💡 Power-up available!",
          description: "Click the floating button to activate it!",
        });
        
        setTimeout(() => {
          setPowerUpVisible(false);
          console.log('💡 Power-up disappeared');
        }, 10000); // Increased visibility duration to 10 seconds
      }
    }, 8000); // Check every 8 seconds (increased from 5 seconds)

    return () => {
      console.log('🧹 Cleaning up power-up interval');
      clearInterval(spawnInterval);
    };
  }, [gameActive, gameState.isGameOver, powerUpVisible, symptomsActive, toast]);

  const handlePowerUpClick = (type: string) => {
    setActivePowerUp(type);
    setPowerUpVisible(false);
    console.log('Power-up activated:', type);
    
    switch (type) {
      case 'slow_time':
        toast({ title: "⏰ Time slowed down!", description: "Timer runs at half speed for 15 seconds" });
        setTimeout(() => setActivePowerUp(null), 15000);
        break;
        
      case 'reveal_letters':
        toast({ title: "💡 Letters revealed!", description: "Irrelevant keys are highlighted" });
        setTimeout(() => setActivePowerUp(null), 12000);
        break;
        
      case 'remove_distraction':
        toast({ title: "🧘 Distractions removed!", description: "No symptoms for 15 seconds" });
        // Clear all active symptoms immediately
        setKeyboardFrozen(false);
        setLetterScrambling(false);
        setColorBlindness(false);
        setContextSwitchActive(false);
        setHyperfocusMode(false);
        // Reset the last symptom time to add extra cooldown
        setLastSymptomTime(Date.now() + 5000); // Add 5 seconds extra cooldown
        setTimeout(() => setActivePowerUp(null), 15000); // Increased duration to 15 seconds
        break;
        
      case 'focus_mode':
        toast({ title: "🎯 Focus mode!", description: "Only game elements visible" });
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
          if (isWinner) {
            toast({
              title: "🎉 Congratulations!",
              description: `You found the word in ${newGuesses.length} tries!`,
            });
          } else {
            toast({
              title: "Game Over",
              description: `The word was ${gameState.targetWord}`,
            });
          }
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
  }, [gameState, keyboardFrozen, contextSwitchActive, letterScrambling, toast]);

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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen bg-background transition-all duration-500 ${activePowerUp === 'focus_mode' ? 'bg-black' : ''}`}>
      <div className="container mx-auto max-w-lg p-4">
        {/* Header */}
        <header className={`text-center py-4 border-b border-border ${activePowerUp === 'focus_mode' ? 'opacity-0' : ''}`}>
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
              🧠 ADHD Mode Active - Symptoms may occur
            </div>
          )}
          {hyperfocusMode && (
            <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              🎯 Hyperfocus Mode - Time moving faster!
            </div>
          )}
          {activePowerUp === 'remove_distraction' && (
            <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              🧘 Distraction-Free Mode Active
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
            <div className={activePowerUp === 'focus_mode' ? 'opacity-0' : ''}>
              <AccessibilityControls 
                settings={adhdSettings}
                onSettingsChange={setADHDSettings}
              />
            </div>

            {/* Main Game Area */}
            <div className="py-4 space-y-4">
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

        {/* Power-up floating action button */}
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
