import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameGrid } from '@/components/GameGrid';
import { GameKeyboard } from '@/components/GameKeyboard';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { GameSummary } from '@/components/GameSummary';
import { ContextSwitchPopup } from '@/components/ContextSwitchPopup';
import { HyperfocusPopup } from '@/components/HyperfocusPopup';
import { DistractionBlob } from '@/components/DistractionBlob';
import { getGuessStatuses, LetterStatus } from '@/lib/wordleUtils';
import { solutions } from '@/lib/solutions';
import { useMediaQuery } from '@/hooks/use-media-query';

import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

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
  { title: '🔔🚨 Urgent Reminder', description: "Don't forget to send that urgent report." },
];

const POWER_UP_META = {
  slow_time: {
    text: '✨ Slow Time!',
    className: 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700',
  },
  reveal_letters: {
    text: '🔍 Reveal Letter!',
    className: 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
  },
  remove_distraction: {
    text: '🧘 Focus!',
    className: 'from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700',
  },
};

const GamePage = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDistractionPenalty, setShowDistractionPenalty] = useState(false);
  const [showMemoryLapse, setShowMemoryLapse] = useState(false);

  // Power-ups
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [availablePowerUp, setAvailablePowerUp] = useState<string | null>(null);
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

  const triggerNotification = useCallback(() => {
    // Prevent notifications if the power-up is active.
    if (activePowerUp === 'remove_distraction') {
      return;
    }
    const notification = FAKE_NOTIFICATIONS[Math.floor(Math.random() * FAKE_NOTIFICATIONS.length)];
    toast.custom(
      (t) => (
        <div
          className={`pointer-events-auto flex w-full max-w-sm items-start space-x-4 rounded-lg bg-background p-4 shadow-lg ring-1 ring-black ring-opacity-5 transition-all ${
            t.visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          } ${!isDesktop ? 'cursor-pointer' : ''}`}
          onClick={!isDesktop ? () => toast.dismiss(t.id) : undefined}
        >
          <div className="flex-1">
            <p className="font-bold">{notification.title}</p>
            <p className="text-sm">{notification.description}</p>
          </div>
          <div className="flex-shrink-0">
            {isDesktop ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
                }}
                className="rounded-full p-1 text-foreground/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <X className="h-5 w-5 text-foreground/50" />
            )}
          </div>
        </div>
      ),
      {
        duration: 6000,
      }
    );
    playRandomNotificationSound();
  }, [activePowerUp, isDesktop]);

  const triggerSymptom = useCallback(() => {
    // Determine which symptom to trigger based on intensity
    const symptomProbability = Math.random();
    let symptomChoice = -1;

    // More direct symptom selection
    const intensityThreshold = 0.2 + adhdSettings.intensity * 0.1; // Range from 0.3 to 0.7

    if (symptomProbability < intensityThreshold) {
      // Pick a random symptom if the threshold is met
      const memoryLapseChance = 0.15; // 15% chance for memory lapse
      // Memory lapse only happens at intensity 3+ and if it wins the random roll
      if (adhdSettings.intensity >= 3 && Math.random() < memoryLapseChance) {
        symptomChoice = 5; // Memory Lapse is special and rare
      } else {
        // Pick from the other 5 symptoms (0 to 4)
        symptomChoice = Math.floor(Math.random() * 5);
      }
    } else {
      // No symptom triggered this time
      return;
    }

    const currentTime = Date.now();
    const durationMultiplier = adhdSettings.intensity / 5;

    switch (symptomChoice) {
      case 0: // Executive Dysfunction (Freeze)
        console.log('🧠 Triggering symptom: Keyboard Freeze');
        setKeyboardFrozen(true);
        setTimeout(() => setKeyboardFrozen(false), 2000 + 2000 * durationMultiplier);
        setLastSymptomTime(currentTime);
        break;
      case 1: // Sensory Overload (Color Blindness)
        console.log('🧠 Triggering symptom: Color Blindness');
        setColorBlindness(true);
        setTimeout(() => setColorBlindness(false), 5000 + 3000 * durationMultiplier);
        setLastSymptomTime(currentTime);
        break;
      case 2: // Context Switching
        console.log('🧠 Triggering symptom: Context Switch');
        setContextSwitchActive(true);
        setLastSymptomTime(currentTime);
        break;
      case 3: {
        // Distraction Blob
        console.log('🧠 Triggering symptom: Distraction Blob');
        // Randomize position - avoid edges
        const top = Math.floor(Math.random() * 80) + 10; // 10% to 90%
        const left = Math.floor(Math.random() * 80) + 10; // 10% to 90%
        setDistractionBlobPosition({ top: `${top}%`, left: `${left}%` });
        setDistractionBlobVisible(true);
        setLastSymptomTime(currentTime);

        // Hide the blob after 5 seconds if not clicked
        const newTimer = setTimeout(() => {
          setDistractionBlobVisible(false);
        }, 5000);
        setDistractionBlobTimer(newTimer);
        break;
      }
      case 4: // Time Distortion
        console.log('🧠 Triggering symptom: Time Distortion');
        setIsTimeDistorted(true);
        setTimeMultiplier(1.5); // Time speeds up by 50%
        setTimeout(() => {
          setIsTimeDistorted(false);
          setTimeMultiplier(1);
        }, 5000 + 3000 * durationMultiplier); // Lasts 5-8 seconds
        setLastSymptomTime(currentTime);
        break;
      case 5: // Memory Lapse
        console.log('🧠 Triggering symptom: Memory Lapse');
        setShowMemoryLapse(true);
        setTimeout(() => setShowMemoryLapse(false), 2500);
        setGameState((prev) => {
          if (prev.guesses.length === 0) {
            return prev; // No guess to erase
          }
          return {
            ...prev,
            guesses: prev.guesses.slice(0, -1),
            statuses: prev.statuses.slice(0, -1),
            currentRow: prev.currentRow - 1,
            currentGuess: '', // Also clear the current typing
          };
        });
        setLastSymptomTime(currentTime);
        break;
      // Notification Overload is now handled in its own effect
      default:
        break;
    }
  }, [adhdSettings.intensity]);

  // ADHD Symptoms - Improved timing with intensity-based frequency
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || !symptomsActive) return;

    // Don't trigger symptoms if remove_distraction power-up is active
    if (activePowerUp === 'remove_distraction') return;

    // Calculate symptom frequency based on intensity (1-5 scale)
    const baseInterval = 6000; // Base interval of 6 seconds
    const intensityMultiplier = 1.1 - adhdSettings.intensity * 0.15; // Higher intensity = more frequent
    const symptomCheckInterval = baseInterval * intensityMultiplier;

    const symptomInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastSymptom = currentTime - lastSymptomTime;

      const minCooldown = 3000 + (5 - adhdSettings.intensity) * 500; // Cooldown from 3s to 5s

      if (timeSinceLastSymptom < minCooldown) {
        return;
      }

      // Check if any major symptom is currently active
      const majorSymptomActive =
        keyboardFrozen || colorBlindness || contextSwitchActive || distractionBlobVisible;

      // Reduce the chance of a new symptom if one is already active
      if (majorSymptomActive && Math.random() < 0.6) {
        return;
      }

      triggerSymptom();
    }, symptomCheckInterval);

    return () => clearInterval(symptomInterval);
  }, [
    gameActive,
    gameState.isGameOver,
    symptomsActive,
    adhdSettings.intensity,
    activePowerUp,
    lastSymptomTime,
    keyboardFrozen,
    colorBlindness,
    isHyperfocusing,
    contextSwitchActive,
    triggerSymptom,
    distractionBlobVisible,
  ]);

  // Dedicated Notification Overload effect
  useEffect(() => {
    if (
      !gameActive ||
      gameState.isGameOver ||
      !symptomsActive ||
      activePowerUp === 'remove_distraction' ||
      adhdSettings.intensity < 3
    ) {
      return;
    }

    let notificationInterval: NodeJS.Timeout;

    const scheduleNotification = () => {
      let delay: number;
      const intensity = adhdSettings.intensity;

      if (intensity === 3) {
        delay = 5000 + Math.random() * 2000; // 5-7 seconds
      } else if (intensity === 4) {
        delay = 3000 + Math.random() * 1000; // 3-4 seconds
      } else if (intensity === 5) {
        delay = 2000; // 2 seconds
      } else {
        return; // Don't run for intensity < 3
      }

      notificationInterval = setTimeout(() => {
        console.log(`🧠 Triggering symptom: Notification Overload at intensity ${intensity}`);
        triggerNotification();
        scheduleNotification(); // Schedule the next one
      }, delay);
    };

    scheduleNotification();

    return () => clearTimeout(notificationInterval);
  }, [
    gameActive,
    gameState.isGameOver,
    symptomsActive,
    adhdSettings.intensity,
    activePowerUp,
    triggerNotification,
  ]);

  // Power-Up Generation
  useEffect(() => {
    if (!gameActive || gameState.isGameOver || availablePowerUp || activePowerUp) {
      return;
    }

    // Try to generate a power-up every 20 seconds
    const powerUpInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        // 40% chance every 20s
        const powerUps = ['slow_time', 'reveal_letters', 'remove_distraction'];
        const chosenPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        console.log(`🎁 Power-up generated: ${chosenPowerUp}`);
        setAvailablePowerUp(chosenPowerUp);
      }
    }, 20000);

    return () => clearInterval(powerUpInterval);
  }, [gameActive, gameState.isGameOver, availablePowerUp, activePowerUp]);

  // Impulse Control Challenge - Distraction Blob Spawning (DISABLED per user request)
  const [distractionActive, setDistractionActive] = useState(false);
  const handleImpulseTrigger = () => {
    // ... existing code ...
  };

  const activatePowerUp = () => {
    if (!availablePowerUp) return;

    const type = availablePowerUp;
    setActivePowerUp(type);
    setAvailablePowerUp(null); // Use it up
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
      if (gameState.isGameOver || keyboardFrozen || isProcessing) {
        console.log('Key press ignored: Game over, keyboard frozen, or already processing.');
        return;
      }

      const upperKey = key.toUpperCase();
      console.log(`Key pressed: ${upperKey}`);

      if (upperKey === 'ENTER') {
        console.log(`Enter pressed. Current guess: "${gameState.currentGuess}"`);
        setIsProcessing(true);

        if (gameState.currentGuess.length !== 5) {
          console.log('Validation failed: Not enough letters.');
          toast.error('Not enough letters');
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
          setIsProcessing(false);
          return;
        }

        const lowerCaseGuess = gameState.currentGuess.toLowerCase();

        // --- Online Word Validation ---
        const toastId = toast.loading('Validating word...');
        try {
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${lowerCaseGuess}`
          );
          toast.dismiss(toastId);
          if (!response.ok) {
            console.log(`Validation failed: "${lowerCaseGuess}" is not a valid word.`);
            toast.error('Not in word list');
            setIsShaking(true);
            setTimeout(() => {
              setIsShaking(false);
              setGameState((prevState) => ({ ...prevState, currentGuess: '' }));
            }, 500);
            setIsProcessing(false);
            return;
          }
          console.log(`Validation successful: "${lowerCaseGuess}" is a valid word.`);
        } catch (error) {
          toast.dismiss(toastId);
          console.error('API validation error:', error);
          toast.error('Could not validate word. Please check your connection.');
          setIsProcessing(false);
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
          toast(`The word was ${gameState.targetWord}`, { icon: 'ℹ️' });
        }
        setIsProcessing(false);
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
    [gameState, keyboardFrozen, isProcessing]
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
    setAvailablePowerUp(null);
    setLastSymptomTime(0);
    setTimeMultiplier(1);
    if (distractionBlobTimer) {
      clearTimeout(distractionBlobTimer);
      setDistractionBlobTimer(null);
    }

    console.log('💥 Clicked a distraction!');
    setDistractionBlobVisible(false);

    // Penalty: Lose 5 seconds
    setTimeElapsed((prev) => Math.min(GAME_DURATION, prev + 5));
    setShowDistractionPenalty(true);
    setTimeout(() => setShowDistractionPenalty(false), 2000);

    // Visual feedback
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
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
    setShowDistractionPenalty(true);
    setTimeout(() => setShowDistractionPenalty(false), 2000);

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
                {/* Power-Up Button */}
                {availablePowerUp && (
                  <button
                    onClick={activatePowerUp}
                    className={`flex-shrink-0 animate-pulse rounded-md bg-gradient-to-r px-3 py-1 text-xs font-bold text-white shadow-lg hover:animate-none ${
                      POWER_UP_META[availablePowerUp as keyof typeof POWER_UP_META].className
                    }`}
                  >
                    {POWER_UP_META[availablePowerUp as keyof typeof POWER_UP_META].text}
                  </button>
                )}
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
                {showDistractionPenalty && (
                  <div className="animate-fade-in rounded bg-yellow-100 px-1.5 py-0.5 text-center text-xs font-bold text-yellow-600">
                    -5s (Clicked Distraction!)
                  </div>
                )}
                {showMemoryLapse && (
                  <div className="animate-fade-in rounded bg-red-100 px-1.5 py-0.5 text-center text-xs font-bold text-red-600">
                    🤯 MEMORY LAPSE!
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

        {distractionBlobVisible && (
          <DistractionBlob onClick={handleDistractionClick} style={distractionBlobPosition} />
        )}

        {contextSwitchActive && activePowerUp !== 'remove_distraction' && (
          <ContextSwitchPopup onComplete={() => setContextSwitchActive(false)} />
        )}
      </div>
    </div>
  );
};

export default GamePage;
