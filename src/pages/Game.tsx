import { useState, useEffect, useCallback } from 'react';
import { Share2 } from 'lucide-react';
import { GameGrid } from '@/components/GameGrid';
import { GameKeyboard } from '@/components/GameKeyboard';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { GameSummary } from '@/components/GameSummary';
import { PowerUpBlob } from '@/components/PowerUpBlob';
import { ContextSwitchPopup } from '@/components/ContextSwitchPopup';
import { HyperfocusPopup } from '@/components/HyperfocusPopup';
import { DistractionBlob } from '@/components/DistractionBlob';
import { getGuessStatuses, LetterStatus } from '@/lib/wordleUtils';
import { solutions } from '@/lib/solutions';

import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

const GAME_DURATION = 300; // 5 minutes
const SYMPTOMS_START_TIME = 20; // Start symptoms after 20 seconds

export interface ADHDSettings {
  intensity: number;
  isAccommodated: boolean;
  isGoodBrainDay: boolean;
}

export interface GameState {
  targetWord: string;
  guesses: string[];
  statuses: LetterStatus[][];
  currentRow: number;
  currentGuess: string;
  isGameOver: boolean;
  isWinner: boolean;
}

const initialGameState: GameState = {
  targetWord: solutions[Math.floor(Math.random() * solutions.length)].toUpperCase(),
  guesses: [],
  statuses: [],
  currentRow: 0,
  currentGuess: '',
  isGameOver: false,
  isWinner: false,
};

const FAKE_NOTIFICATIONS = [
  { title: '💬 New Message', description: 'From Alex: "Hey, you free later?"' },
  { title: '📸 Social Media', description: 'Someone tagged you in 3 photos.' },
  { title: '📰 News Alert', description: 'Breaking: A new study on productivity released.' },
  { title: '📦 Shopping', description: 'Your package has been shipped!' },
  { title: '📅 Calendar', description: 'Reminder: Team meeting in 15 minutes.' }
];

const GamePage = () => {

  const handleCopyToClipboard = () => {
    const title = `ADHD Wordle ${gameState.guesses.length}/6`;
    const emojiGrid = gameState.statuses
      .map(row =>
        row
          .map(status => {
            switch (status) {
              case 'correct':
                return '🟩';
              case 'present':
                return '🟨';
              default:
                return '⬛';
            }
          })
          .join('')
      )
      .join('\n');

    const shareText = `${title}\n\n${emojiGrid}\n\nhttps://wordleadhd.netlify.app/`;
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('Results copied to clipboard!');
    }).catch(err => {
      toast.error('Could not copy results.');
      console.error('Failed to copy: ', err);
    });
  };

  const handleShareOnX = () => {
    const title = `I solved the ADHD Wordle! ${gameState.isWinner ? `${gameState.guesses.length}/6 tries` : '🧠'}`;
    const emojiGrid = gameState.statuses
      .map(row =>
        row
          .map(status => {
            switch (status) {
              case 'correct':
                return '🟩';
              case 'present':
                return '🟨';
              default:
                // Using a white square for better visibility on X
                return '⬜';
            }
          })
          .join('')
      )
      .join('\n');

    const text = `${title}\n\n${emojiGrid}\n\nCan you beat my score?`;
    const url = 'https://wordleadhd.netlify.app/'; // The URL to the game
    const hashtags = 'ADHD,Wordle,BrainGames,VibeCheck';

    // Construct the X intent URL
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;

    // Open the URL in a new tab
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };
  
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const [adhdSettings, setADHDSettings] = useState<ADHDSettings>({
    intensity: 3,
    isAccommodated: false,
    isGoodBrainDay: false,

  });

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [symptomsActive, setSymptomsActive] = useState(false);
  
  // ADHD Symptoms with improved timing
  const [keyboardFrozen, setKeyboardFrozen] = useState(false);
  const [colorBlindness, setColorBlindness] = useState(false);
  const [contextSwitchActive, setContextSwitchActive] = useState(false);
  const [isHyperfocusing, setIsHyperfocusing] = useState(false);
  const [isTimeDistorted, setIsTimeDistorted] = useState(false);
  const [distractionBlobVisible, setDistractionBlobVisible] = useState(false);
  const [lastSymptomTime, setLastSymptomTime] = useState(0);
  
  // Power-ups
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [powerUpVisible, setPowerUpVisible] = useState(false);
  const [powerUpType, setPowerUpType] = useState<string>('');
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const [distractionBlobPosition, setDistractionBlobPosition] = useState({ top: '50%', left: '50%' });
  const [distractionBlobTimer, setDistractionBlobTimer] = useState<NodeJS.Timeout | null>(null);

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
      const majorSymptomActive = keyboardFrozen || colorBlindness || isHyperfocusing;
      
      const random = Math.random();
      console.log('🎲 Symptom check:', random);
      
      // Intensity-based trigger chance (20% base + intensity bonus)
      const triggerChance = 0.15 + (adhdSettings.intensity * 0.05); // 20% to 40% based on intensity
      
      if (random < triggerChance) {
        const symptomRoll = Math.random();
        console.log('🎯 Symptom type roll:', symptomRoll);
        
        setLastSymptomTime(currentTime);
        
        // Rebalanced frequencies - now with Time Distortion
        if (symptomRoll < 0.17 && !majorSymptomActive) {
          console.log('🔒 TRIGGERING: Keyboard freeze');
          setKeyboardFrozen(true);
          setTimeout(() => setKeyboardFrozen(false), 3500 + (adhdSettings.intensity * 300));
        } else if (symptomRoll < 0.34 && !majorSymptomActive) {
          console.log('👁️ TRIGGERING: Color blindness');
          setColorBlindness(true);
          setTimeout(() => setColorBlindness(false), 5000 + (adhdSettings.intensity * 500));
        } else if (symptomRoll < 0.51) {
          console.log('📱 TRIGGERING: Notification Overload');
          const notification = FAKE_NOTIFICATIONS[Math.floor(Math.random() * FAKE_NOTIFICATIONS.length)];
          toast.info(notification.title, { description: notification.description, duration: 3000 });
        } else if (symptomRoll < 0.68 && !majorSymptomActive) {
          console.log('😵 TRIGGERING: Hyperfocus Episode');
          setIsHyperfocusing(true);
        } else if (symptomRoll < 0.85 && !isTimeDistorted) {
            console.log('⏳ TRIGGERING: Time Distortion');
            setIsTimeDistorted(true);
            setTimeMultiplier(2); // Speed up time
            setTimeout(() => {
              setIsTimeDistorted(false);
              setTimeMultiplier(1); // Reset time
            }, 4000 + (adhdSettings.intensity * 200)); // Duration scales slightly
        } else {
          console.log('🔄 TRIGGERING: Context switch');
          setContextSwitchActive(true);
        }
      }
    }, symptomCheckInterval);

    return () => {
      console.log('🧹 Cleaning up symptoms interval');
      clearInterval(symptomInterval);
    };
  }, [gameActive, gameState.isGameOver, symptomsActive, activePowerUp, keyboardFrozen, colorBlindness, lastSymptomTime, adhdSettings.intensity]);

  // Impulse Control Challenge - Distraction Blob Spawning
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || !symptomsActive || activePowerUp === 'remove_distraction') {
      setDistractionBlobVisible(false);
      return;
    }

    const baseInterval = 15000; // 15 seconds
    const intensityMultiplier = Math.max(0.4, 1.2 - (adhdSettings.intensity * 0.15));
    const spawnIntervalTime = baseInterval * intensityMultiplier;

    const spawnInterval = setInterval(() => {
      if (!distractionBlobVisible) {
        console.log('✨ Spawning Distraction Blob');
        const top = `${Math.random() * 60 + 20}%`;
        const left = `${Math.random() * 70 + 15}%`;
        setDistractionBlobPosition({ top, left });
        setDistractionBlobVisible(true);

        // Automatically hide the blob after 5 seconds if not clicked
        const hideTimer = setTimeout(() => {
          setDistractionBlobVisible(false);
          console.log('💨 Distraction blob disappeared.');
        }, 5000);

        // Store timer to clear it if clicked
        setDistractionBlobTimer(hideTimer);
      }
    }, spawnIntervalTime);

    return () => clearInterval(spawnInterval);
  }, [gameActive, gameState.isGameOver, symptomsActive, adhdSettings.intensity, distractionBlobVisible, activePowerUp]);



  // Power-up spawning - Fixed timing
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || powerUpVisible || !symptomsActive) return;

    console.log('💡 Starting power-up spawning system');

    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.3) { // Reduced to 30% chance
        const powerUpTypes = ['slow_time', 'reveal_letters', 'remove_distraction'];
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
        setColorBlindness(false);
        setContextSwitchActive(false);
        // Reset the last symptom time to add extra cooldown
        setLastSymptomTime(Date.now() + 8000); // Add 8 seconds extra cooldown
        setTimeout(() => setActivePowerUp(null), 15000); // 15 seconds duration
        break;
        

    }
  };

  const handleKeyPress = useCallback(async (key: string) => {
    if (gameState.isGameOver || keyboardFrozen) {
      console.log('Key press ignored: Game over or keyboard frozen.');
      return;
    }

    const upperKey = key.toUpperCase();
    console.log(`Key pressed: ${upperKey}`);

    if (upperKey === 'ENTER') {
      console.log(`Enter pressed. Current guess: "${gameState.currentGuess}"`);

      if (gameState.currentGuess.length !== 5) {
        console.log('Validation failed: Not enough letters.');
        toast.error('Not enough letters');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }

      const lowerCaseGuess = gameState.currentGuess.toLowerCase();

      // --- Online Word Validation ---
      toast.loading('Validating word...');
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lowerCaseGuess}`);
        toast.dismiss();
        if (!response.ok) {
          console.log(`Validation failed: "${lowerCaseGuess}" is not a valid word.`);
          toast.error('Not in word list');
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setGameState(prevState => ({ ...prevState, currentGuess: '' }));
          }, 500);
          return;
        }
        console.log(`Validation successful: "${lowerCaseGuess}" is a valid word.`);
      } catch (error) {
        toast.dismiss();
        console.error('API validation error:', error);
        toast.error('Could not validate word. Please check your connection.');
        return;
      }
      // --- End Online Word Validation ---

      console.log('Guess is valid. Proceeding with game logic.');
      const newGuesses = [...gameState.guesses, gameState.currentGuess];
      const newStatuses = [...gameState.statuses, getGuessStatuses(gameState.currentGuess, gameState.targetWord)];
      const isWinner = gameState.currentGuess.toUpperCase() === gameState.targetWord.toUpperCase();
      const isGameOver = newGuesses.length === 6 || isWinner;

      setGameState(prevState => ({
        ...prevState,
        guesses: newGuesses,
        statuses: newStatuses,
        currentRow: prevState.currentRow + 1,
        currentGuess: '',
        isWinner,
        isGameOver
      }));

      if (isWinner) {
        console.log('Game over: Player won!');
        toast.success('You won!');
      } else if (isGameOver) {
        console.log(`Game over: No more guesses. The word was ${gameState.targetWord}`);
        toast.info(`The word was ${gameState.targetWord}`);
      }

    } else if (upperKey === 'BACKSPACE') {
      setGameState(prevState => ({
        ...prevState,
        currentGuess: prevState.currentGuess.slice(0, -1)
      }));
    } else if (gameState.currentGuess.length < 5 && /^[A-Z]$/.test(upperKey)) {
      setGameState(prevState => ({
        ...prevState,
        currentGuess: prevState.currentGuess + upperKey
      }));
    }
  }, [gameState, keyboardFrozen]);

  const resetGame = () => {
    setGameState({
      ...initialGameState,
      targetWord: solutions[Math.floor(Math.random() * solutions.length)].toUpperCase(),
      guesses: [],
      statuses: [],
      currentRow: 0,
      currentGuess: '',
      isGameOver: false,
      isWinner: false,
    });
    setTimeElapsed(0);
    setGameActive(true);
    setSymptomsActive(false);
    setKeyboardFrozen(false);
    setColorBlindness(false);
    setContextSwitchActive(false);
    setActivePowerUp(null);
    setPowerUpVisible(false);
    setLastSymptomTime(0);
    setTimeMultiplier(1);
  };

  const handleDistractionClick = () => {
    if (distractionBlobTimer) {
      clearTimeout(distractionBlobTimer);
      setDistractionBlobTimer(null);
    }

    console.log('💥 Clicked a distraction!');
    setDistractionBlobVisible(false);

    // Penalty: Lose 5 seconds
    setTimeElapsed(prev => Math.min(GAME_DURATION, prev + 5));
    toast.error('Distraction! You lost 5 seconds.', {
      duration: 2000,
    });

    // Visual feedback
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 bg-background`}>
      <div className={`container mx-auto max-w-lg p-4`}>
        {/* Header */}
        <header className={`text-center py-4 border-b border-border`}>
          <h1 className="text-2xl font-bold text-foreground">ADHD Wordle</h1>
          
          {/* Combined Stats */}
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Attempt: {gameState.currentRow + 1}/6</span>
            <span className={`transition-all duration-300 ${isTimeDistorted ? 'text-red-500 font-extrabold animate-pulse' : (timeRemaining < 60 ? 'text-red-500 font-bold' : '')}`}>
              Remaining: {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Symptom Status Indicators */}
          <div className="mt-1 space-y-1 min-h-[1.75rem]">
            {keyboardFrozen && activePowerUp !== 'remove_distraction' && (
              <div className="text-center text-sm text-red-600 font-bold bg-red-100 py-1 px-2 rounded">
                🔒 KEYBOARD FROZEN
              </div>
            )}
            {colorBlindness && activePowerUp !== 'remove_distraction' && (
              <div className="text-center text-sm text-purple-600 font-bold bg-purple-100 py-1 px-2 rounded">
                👁️ COLORS DISRUPTED
              </div>
            )}
          </div>
        </header>

        {/* Show game summary if game is over */}
        {gameState.isGameOver ? (
          <div className="py-4 space-y-4">
            <GameSummary 
              gameState={gameState}
              timeElapsed={timeElapsed}
              correctWord={gameState.targetWord}
            />
            
            <div className="text-center flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Copy Results
              </button>
              <button
                onClick={handleShareOnX}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75ZM11.46 13.812h1.57L4.34 2.188H2.76l8.7 11.624Z"/>
                </svg>
                Share on X
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ADHD Controls & Status */}
            <div className={`flex items-center justify-between p-2 bg-background/20 rounded-lg border border-border/50 mb-2`}>
              <AccessibilityControls 
                settings={adhdSettings}
                onSettingsChange={setADHDSettings}
              />
              {/* Other Mode Indicators */}
              <div className="flex flex-wrap items-center justify-end gap-1 text-xs">
                  {symptomsActive && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block m-1">
                      🧠 ADHD Mode Active - Intensity: {adhdSettings.intensity}/5
                    </div>
                  )}

                  {activePowerUp === 'remove_distraction' && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded inline-block m-1">
                      🧘 Distraction-Free
                    </div>
                  )}
                  {activePowerUp === 'slow_time' && (
                    <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded inline-block m-1">
                      ⏰ Time Slowed Down!
                    </div>
                  )}
              </div>
            </div>

            {/* Main Game Area */}
            <div className={`py-2 space-y-2`}>
              <GameGrid 
                gameState={gameState}
                colorBlindness={colorBlindness && activePowerUp !== 'remove_distraction'}
                isShaking={isShaking}
              />
              
              <GameKeyboard 
                onKeyPress={handleKeyPress}
                gameState={gameState}
                frozen={keyboardFrozen && activePowerUp !== 'remove_distraction'}
                revealLetters={activePowerUp === 'reveal_letters'}
                targetWord={gameState.targetWord}
              />
            </div>

          </>
        )}

        {isHyperfocusing && <HyperfocusPopup onClose={() => setIsHyperfocusing(false)} />}

        {/* Power-up floating action button - Enhanced for mobile */}
        {powerUpVisible && (
          <PowerUpBlob 
            type={powerUpType}
            onClick={() => handlePowerUpClick(powerUpType)}
          />
        )}

        {distractionBlobVisible && (
          <DistractionBlob 
            onClick={handleDistractionClick}
            style={distractionBlobPosition} 
          />
        )}

        {/* Context switch popup */}
        {contextSwitchActive && activePowerUp !== 'remove_distraction' && (
          <ContextSwitchPopup 
            onComplete={() => setContextSwitchActive(false)}
          />
        )}
        <Toaster />
      </div>
    </div>
  );
};

export default GamePage;
