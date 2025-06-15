import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const GAME_DURATION = 300; // 5 minutes
const SYMPTOMS_START_TIME = 5; // Start symptoms after 5 seconds

// Ensure explicit or offensive words are never chosen as the solution
const bannedWords = [
  'dildo',
  'penis',
  'vagina',
  'cunt',
  'dicks',
  'boobs',
  'titty',
  'titties',
  'anus',
  'anal',
];

const getSafeRandomWord = (): string => {
  let candidate = '';
  do {
    candidate = solutions[Math.floor(Math.random() * solutions.length)];
  } while (bannedWords.includes(candidate.toLowerCase()));
  return candidate.toUpperCase();
};

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
  targetWord: getSafeRandomWord(),
  guesses: [],
  statuses: [],
  currentRow: 0,
  currentGuess: '',
  isGameOver: false,
  isWinner: false,
};

// Sound effects for notification overload (place mp3 files in public/sounds)
const NOTIFICATION_SOUNDS = [
  '/sounds/notification1.mp3',
  '/sounds/notification2.mp3',
  '/sounds/notification3.mp3',
];

const playRandomNotificationSound = () => {
  const src = NOTIFICATION_SOUNDS[Math.floor(Math.random() * NOTIFICATION_SOUNDS.length)];
  const audio = new Audio(src);
  audio.play().catch(() => {
    /* ignore autoplay restrictions */
  });
};

const FAKE_NOTIFICATIONS = [
  { title: '💬 New Message', description: 'From Alex: "Hey, you free later?"' },
  { title: '📸 Social Media', description: 'Someone tagged you in 3 photos.' },
  { title: '📰 News Alert', description: 'Breaking: A new study on productivity released.' },
  { title: '📦 Shopping', description: 'Your package has been shipped!' },
  { title: '📅 Calendar', description: 'Reminder: Team meeting in 15 minutes.' },
];

const GamePage = () => {
  // Auto-scroll on mobile to hide header and reveal buffer zone
  useEffect(() => {
    if (window.innerWidth <= 768) {
      // allow layout to paint first
      setTimeout(() => {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }, 100);
    }
  }, []);
  const navigate = useNavigate();

  const handleCopyToClipboard = () => {
    const title = `ADHD Wordle ${gameState.guesses.length}/6`;
    const emojiGrid = gameState.statuses
      .map((row) =>
        row
          .map((status) => {
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
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        toast.success('Results copied to clipboard!');
      })
      .catch((err) => {
        toast.error('Could not copy results.');
        console.error('Failed to copy: ', err);
      });
  };

  const handleShareOnX = () => {
    const title = `I solved the ADHD Wordle! ${gameState.isWinner ? `${gameState.guesses.length}/6 tries` : '🧠'}`;
    const emojiGrid = gameState.statuses
      .map((row) =>
        row
          .map((status) => {
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
  const [distractionBlobPosition, setDistractionBlobPosition] = useState({
    top: '50%',
    left: '50%',
  });
  const [distractionBlobTimer, setDistractionBlobTimer] = useState<NodeJS.Timeout | null>(null);

  const timeRemaining = Math.max(0, GAME_DURATION - timeElapsed);

  // Main game timer
  useEffect(() => {
    if (!gameActive || gameState.isGameOver) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + timeMultiplier;

        // Activate symptoms after SYMPTOMS_START_TIME
        if (newTime >= SYMPTOMS_START_TIME && !symptomsActive) {
          setSymptomsActive(true);
          console.log('🧠 Symptoms activated at time:', newTime);
        }

        if (newTime >= GAME_DURATION) {
          setGameActive(false);
          setGameState((prevState) => ({
            ...prevState,
            isGameOver: true,
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
    const intensityMultiplier = Math.max(0.3, 1.1 - adhdSettings.intensity * 0.23); // Higher intensity = more frequent
    const symptomCheckInterval = baseInterval * intensityMultiplier;

    console.log('🎯 Symptom check interval:', symptomCheckInterval, 'ms');

    const symptomInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastSymptom = currentTime - lastSymptomTime;

      // Minimum cooldown based on intensity (higher intensity = shorter cooldown)
      const minCooldown = Math.max(5000, 12000 - adhdSettings.intensity * 1725);

      if (timeSinceLastSymptom < minCooldown) {
        console.log('⏳ Symptom on cooldown, skipping...');
        return;
      }

      // Check if any major symptom is currently active
      const majorSymptomActive = keyboardFrozen || colorBlindness || isHyperfocusing;

      const random = Math.random();
      console.log('🎲 Symptom check:', random);

      // Intensity-based trigger chance (20% base + intensity bonus)
      let triggerChance = 0.17 + adhdSettings.intensity * 0.058; // base chance
      if (adhdSettings.intensity <= 3) {
        triggerChance = Math.min(0.9, triggerChance * 3); // triple for levels 1-3, cap at 90%
      }

      if (random < triggerChance) {
        const symptomRoll = Math.random();
        const attemptsMade = gameState.guesses.length; // 0-5
        // Memory-lapse window widens by 3 % per extra attempt, capped +15 %
        const memLapseThreshold = Math.min(0.75, 0.6 + attemptsMade * 0.03);
        console.log('🎯 Symptom type roll:', symptomRoll);

        setLastSymptomTime(currentTime);

        // Rebalanced frequencies including new Memory Lapse symptom
        if (symptomRoll < 0.25 && !majorSymptomActive) {
          console.log('🔒 TRIGGERING: Keyboard freeze');
          setKeyboardFrozen(true);
          setTimeout(() => setKeyboardFrozen(false), 3500 + adhdSettings.intensity * 300);
        } else if (symptomRoll < 0.5 && !majorSymptomActive) {
          console.log('👁️ TRIGGERING: Color blindness');
          setColorBlindness(true);
          setTimeout(() => setColorBlindness(false), 3000 + adhdSettings.intensity * 200);
        } else if (symptomRoll < memLapseThreshold) {
          console.log('📱 TRIGGERING: Notification Overload');
          playRandomNotificationSound();
          const notification =
            FAKE_NOTIFICATIONS[Math.floor(Math.random() * FAKE_NOTIFICATIONS.length)];
          toast.info(notification.title, { description: notification.description, duration: 3000 });
          console.log('🧠 TRIGGERING: Memory Lapse');
          // remove last guess permanently
          setGameState((prev) => {
            if (prev.guesses.length === 0) return prev;
            const newGuesses = [...prev.guesses];
            const newStatuses = [...prev.statuses];
            newGuesses.pop();
            newStatuses.pop();
            return {
              ...prev,
              guesses: newGuesses,
              statuses: newStatuses,
              currentRow: Math.max(0, prev.currentRow - 1),
            } as GameState;
          });
          toast.error('Memory lapse! Your last word vanished.', { duration: 2500 });
        } else if (symptomRoll < 0.8 && !majorSymptomActive) {
          console.log('😵 TRIGGERING: Hyperfocus Episode');
          setIsHyperfocusing(true);
        } else if (symptomRoll < 0.9 && !isTimeDistorted) {
          console.log('⏳ TRIGGERING: Time Distortion');
          setIsTimeDistorted(true);
          setTimeMultiplier(2); // Speed up time
          setTimeout(
            () => {
              setIsTimeDistorted(false);
              setTimeMultiplier(1); // Reset time
            },
            4000 + adhdSettings.intensity * 200
          ); // Duration scales slightly
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
  }, [
    gameActive,
    gameState.isGameOver,
    symptomsActive,
    activePowerUp,
    keyboardFrozen,
    colorBlindness,
    lastSymptomTime,
    adhdSettings.intensity,
  ]);

  // Impulse Control Challenge - Distraction Blob Spawning (DISABLED per user request)
  useEffect(() => {
    if (
      !gameActive ||
      gameState.isGameOver ||
      !symptomsActive ||
      activePowerUp === 'remove_distraction'
    ) {
      setDistractionBlobVisible(false);
      return;
    }

    const baseInterval = 15000; // 15 seconds
    const intensityMultiplier = Math.max(0.4, 1.2 - adhdSettings.intensity * 0.18);
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
  }, [
    gameActive,
    gameState.isGameOver,
    symptomsActive,
    adhdSettings.intensity,
    distractionBlobVisible,
    activePowerUp,
  ]);

  // 🔔 Independent Notification Overload timer
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || !symptomsActive) return;

    const triggerNotification = () => {
      playRandomNotificationSound();
      const notification =
        FAKE_NOTIFICATIONS[Math.floor(Math.random() * FAKE_NOTIFICATIONS.length)];
      toast.info(notification.title, {
        description: notification.description,
        duration: 3000,
      });
    };

    const computeInterval = () => {
      const base = 6000; // target ~6 s at intensity 3
      const jitter = Math.random() * 2000 - 1000; // ±1 s
      const intensityAdjustment = Math.max(0, adhdSettings.intensity - 3) * 1000; // -1 s per level above 3
      const interval = Math.max(3000, base - intensityAdjustment + jitter);
      return interval;
    };

    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      const interval = computeInterval();
      timeoutId = setTimeout(() => {
        triggerNotification();
        scheduleNext();
      }, interval);
    };

    // start the loop
    scheduleNext();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [gameActive, gameState.isGameOver, symptomsActive, adhdSettings.intensity]);

  // Power-up spawning - Fixed timing
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || powerUpVisible || !symptomsActive) return;

    console.log('💡 Starting power-up spawning system');

    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        // Reduced to 30% chance
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

  const handleKeyPress = useCallback(
    async (key: string) => {
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
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${lowerCaseGuess}`
          );
          toast.dismiss();
          if (!response.ok) {
            console.log(`Validation failed: "${lowerCaseGuess}" is not a valid word.`);
            toast.error('Not in word list');
            setIsShaking(true);
            setTimeout(() => {
              setIsShaking(false);
              setGameState((prevState) => ({ ...prevState, currentGuess: '' }));
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
        const newStatuses = [
          ...gameState.statuses,
          getGuessStatuses(gameState.currentGuess, gameState.targetWord),
        ];
        const isWinner =
          gameState.currentGuess.toUpperCase() === gameState.targetWord.toUpperCase();
        const isGameOver = newGuesses.length === 6 || isWinner;

        setGameState((prevState) => ({
          ...prevState,
          guesses: newGuesses,
          statuses: newStatuses,
          currentRow: prevState.currentRow + 1,
          currentGuess: '',
          isWinner,
          isGameOver,
        }));

        if (isWinner) {
          console.log('Game over: Player won!');
          toast.success('You won!');
        } else if (isGameOver) {
          console.log(`Game over: No more guesses. The word was ${gameState.targetWord}`);
          toast.info(`The word was ${gameState.targetWord}`);
        }
      } else if (upperKey === 'BACKSPACE') {
        setGameState((prevState) => ({
          ...prevState,
          currentGuess: prevState.currentGuess.slice(0, -1),
        }));
      } else if (gameState.currentGuess.length < 5 && /^[A-Z]$/.test(upperKey)) {
        setGameState((prevState) => ({
          ...prevState,
          currentGuess: prevState.currentGuess + upperKey,
        }));
      }
    },
    [gameState, keyboardFrozen]
  );

  const resetGame = () => {
    setGameState({
      ...initialGameState,
      targetWord: getSafeRandomWord(),
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
    setTimeElapsed((prev) => Math.min(GAME_DURATION, prev + 5));
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
      <div
        className={`w-full ${gameState.isGameOver ? '' : 'max-w-md'} mx-auto flex flex-col flex-grow p-4`}
      >
        {/* Conditional Rendering: Game View vs. Summary View */}
        {gameState.isGameOver ? (
          <div className="w-full flex-grow animate-fade-in">
            <GameSummary
              gameState={gameState}
              timeElapsed={timeElapsed}
              correctWord={gameState.targetWord}
              onCopyToClipboard={handleCopyToClipboard}
              onShareOnX={handleShareOnX}
              onPlayAgain={resetGame}
              onGoHome={() => navigate('/')}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="text-center py-2 border-b border-border">
              <h1 className="text-2xl font-bold text-foreground">ADHD Wordle</h1>
              <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                <span>Attempt: {gameState.guesses.length + 1} / 6</span>
                <span
                  className={`transition-all duration-300 ${isTimeDistorted ? 'text-red-500 font-extrabold animate-pulse' : timeRemaining < 60 ? 'text-red-500 font-bold' : ''}`}
                >
                  Remaining: {formatTime(timeRemaining)}
                </span>
              </div>
            </header>

            {/* -- CONTROLS & STATUS -- */}
            <div className="p-2 bg-background/20 rounded-lg border border-border/50 my-2 space-y-2">
              {/* Intensity Slider - Always Visible */}
              <AccessibilityControls settings={adhdSettings} onSettingsChange={setADHDSettings} />

              {/* Status Indicator Bar - Non-Collapsing */}
              <div className="min-h-[2rem] flex justify-center items-center gap-2 flex-wrap bg-muted/50 p-1 rounded-md">
                {/* Symptom Indicators */}
                {(contextSwitchActive || isHyperfocusing) &&
                  activePowerUp !== 'remove_distraction' && (
                    <div className="text-center text-xs text-blue-600 font-bold bg-blue-100 py-0.5 px-1.5 rounded">
                      🧠 DISTRACTION ACTIVE
                    </div>
                  )}
                {keyboardFrozen && activePowerUp !== 'remove_distraction' && (
                  <div className="text-center text-xs text-red-600 font-bold bg-red-100 py-0.5 px-1.5 rounded">
                    🔒 KEYBOARD FROZEN
                  </div>
                )}
                {colorBlindness && activePowerUp !== 'remove_distraction' && (
                  <div className="text-center text-xs text-purple-600 font-bold bg-purple-100 py-0.5 px-1.5 rounded">
                    👁️ COLORS DISRUPTED
                  </div>
                )}
                {isShaking && activePowerUp !== 'remove_distraction' && (
                  <div className="text-center text-xs text-orange-600 font-bold bg-orange-100 py-0.5 px-1.5 rounded">
                    😵 SENSORY OVERLOAD
                  </div>
                )}

                {/* Power-Up Indicators */}
                {activePowerUp === 'remove_distraction' && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded inline-block text-xs font-bold">
                    🧘 DISTRACTION-FREE
                  </div>
                )}
                {activePowerUp === 'slow_time' && (
                  <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded inline-block text-xs font-bold">
                    ⏰ TIME SLOWED
                  </div>
                )}
              </div>
            </div>
            <div className={`flex-grow flex flex-col justify-center space-y-1 py-1`}>
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
        {powerUpVisible && (
          <PowerUpBlob type={powerUpType} onClick={() => handlePowerUpClick(powerUpType)} />
        )}

        {distractionBlobVisible && (
          <DistractionBlob onClick={handleDistractionClick} style={distractionBlobPosition} />
        )}

        {contextSwitchActive && activePowerUp !== 'remove_distraction' && (
          <ContextSwitchPopup onComplete={() => setContextSwitchActive(false)} />
        )}
        <Toaster />
      </div>
    </div>
  );
};

export default GamePage;
