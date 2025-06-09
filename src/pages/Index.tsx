
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
  
  // ADHD Symptoms
  const [keyboardFrozen, setKeyboardFrozen] = useState(false);
  const [letterScrambling, setLetterScrambling] = useState(false);
  const [colorBlindness, setColorBlindness] = useState(false);
  const [hyperfocusMode, setHyperfocusMode] = useState(false);
  const [contextSwitchActive, setContextSwitchActive] = useState(false);
  
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
        const newTime = prev + (hyperfocusMode ? 2 : 1); // Double speed during hyperfocus
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
  }, [gameActive, gameState.isGameOver, hyperfocusMode, gameState.targetWord, toast]);

  // ADHD Symptoms - simplified logic
  useEffect(() => {
    if (!gameActive || gameState.isGameOver) return;
    if (timeElapsed < SYMPTOMS_START_TIME) return;
    if (activePowerUp === 'remove_distraction') return;

    console.log('🧠 ADHD symptoms system active at time:', timeElapsed);

    const symptomInterval = setInterval(() => {
      const random = Math.random();
      console.log('🎲 Symptom roll:', random, 'at time:', timeElapsed);
      
      // Much higher chance for symptoms to trigger
      if (random < 0.7) { // 70% chance every 2-4 seconds
        const symptomType = Math.random();
        
        if (symptomType < 0.3 && !keyboardFrozen) {
          console.log('🔒 ACTIVATING: Keyboard freeze');
          setKeyboardFrozen(true);
          toast({
            title: "🔒 Focus interrupted!",
            description: "Keyboard frozen for a moment...",
          });
          setTimeout(() => {
            setKeyboardFrozen(false);
            console.log('🔓 Keyboard unfrozen');
          }, 1500 + Math.random() * 1000);
        }
        else if (symptomType < 0.6 && !letterScrambling) {
          console.log('🔀 ACTIVATING: Letter scrambling');
          setLetterScrambling(true);
          toast({
            title: "🔀 Letters scrambling!",
            description: "Words getting mixed up...",
          });
          setTimeout(() => {
            setLetterScrambling(false);
            console.log('✅ Letter scrambling stopped');
          }, 2000 + Math.random() * 1500);
        }
        else if (symptomType < 0.8 && !colorBlindness) {
          console.log('👁️ ACTIVATING: Color blindness');
          setColorBlindness(true);
          toast({
            title: "👁️ Colors fading!",
            description: "Visual feedback disrupted...",
          });
          setTimeout(() => {
            setColorBlindness(false);
            console.log('🌈 Colors restored');
          }, 2500 + Math.random() * 1500);
        }
        else if (symptomType < 0.95 && !contextSwitchActive) {
          console.log('🎪 ACTIVATING: Context switch');
          setContextSwitchActive(true);
          toast({
            title: "🎪 Context switch!",
            description: "Something else grabbed your attention...",
          });
        }
        else if (!hyperfocusMode) {
          console.log('🎯 ACTIVATING: Hyperfocus mode');
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
      }
    }, 2000 + Math.random() * 2000); // Every 2-4 seconds

    return () => {
      console.log('🧹 Cleaning up symptoms interval');
      clearInterval(symptomInterval);
    };
  }, [timeElapsed, gameActive, gameState.isGameOver, activePowerUp, keyboardFrozen, letterScrambling, colorBlindness, hyperfocusMode, contextSwitchActive, toast]);

  // Power-up spawning - only after symptoms start
  useEffect(() => {
    if (timeElapsed < SYMPTOMS_START_TIME || !gameActive || gameState.isGameOver || powerUpVisible) return;

    console.log('💡 Power-up spawning check at time:', timeElapsed);

    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every interval
        const powerUpTypes = ['slow_time', 'reveal_letters', 'remove_distraction', 'focus_mode'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        setPowerUpType(randomType);
        setPowerUpVisible(true);
        console.log('💡 Power-up spawned:', randomType);
        
        // Remove power-up after 8 seconds if not clicked
        setTimeout(() => {
          setPowerUpVisible(false);
          console.log('💡 Power-up disappeared');
        }, 8000);
      }
    }, 8000 + Math.random() * 12000); // Every 8-20 seconds

    return () => clearInterval(spawnInterval);
  }, [timeElapsed, gameActive, gameState.isGameOver, powerUpVisible]);

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
        toast({ title: "🧘 Distractions removed!", description: "No symptoms for 10 seconds" });
        setKeyboardFrozen(false);
        setLetterScrambling(false);
        setColorBlindness(false);
        setTimeout(() => setActivePowerUp(null), 10000);
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
    setKeyboardFrozen(false);
    setLetterScrambling(false);
    setColorBlindness(false);
    setHyperfocusMode(false);
    setContextSwitchActive(false);
    setActivePowerUp(null);
    setPowerUpVisible(false);
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
          {timeElapsed >= SYMPTOMS_START_TIME && (
            <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              🧠 ADHD Mode Active - Symptoms may occur
            </div>
          )}
          {hyperfocusMode && (
            <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              🎯 Hyperfocus Mode - Time moving faster!
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
              <div className="text-center text-sm text-red-600 mt-2">
                ⏳ Keyboard frozen...
              </div>
            )}

            {letterScrambling && activePowerUp !== 'remove_distraction' && (
              <div className="text-center text-sm text-yellow-600 mt-2">
                🔀 Letters scrambling...
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
        {contextSwitchActive && (
          <ContextSwitchPopup 
            onComplete={() => setContextSwitchActive(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
