import { useState, useEffect, useCallback } from 'react';
import { GameGrid } from '@/components/GameGrid';
import { GameKeyboard } from '@/components/GameKeyboard';
import { DistractionLayer } from '@/components/DistractionLayer';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { SymptomManager } from '@/components/SymptomManager';
import { NoroAssistant } from '@/components/NoroAssistant';
import { SuperpowerManager } from '@/components/SuperpowerManager';
import { GameSummary } from '@/components/GameSummary';
import { useToast } from '@/hooks/use-toast';

const WORD_LIST = ['FOCUS', 'BRAIN', 'CHAOS', 'SPARK', 'DRIFT', 'STORM', 'PEACE', 'BURST', 'GLOW', 'RUSH'];
const GAME_DURATION = 300; // 5 minutes

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
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isExecutiveDysfunctionActive, setIsExecutiveDysfunctionActive] = useState(false);
  const [isDistracted, setIsDistracted] = useState(false);
  const [sensoryOverload, setSensoryOverload] = useState(false);
  const [activeSuperpower, setActiveSuperpower] = useState<string | null>(null);
  const [superpowersUsed, setSuperpowersUsed] = useState<string[]>([]);
  const [symptomsExperienced, setSymptomsExperienced] = useState<string[]>([]);
  const [noroAssistanceCount, setNoroAssistanceCount] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [noroGuidance, setNoroGuidance] = useState<any>(null);
  const [focusMode, setFocusMode] = useState(false);

  const timeRemaining = Math.max(0, GAME_DURATION - timeElapsed);

  // Time blindness effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + timeSpeed;
        if (newTime >= GAME_DURATION && !gameEnded) {
          setGameEnded(true);
          setGameState(prevState => ({
            ...prevState,
            isGameOver: true
          }));
          toast({
            title: "⏰ Time's up!",
            description: "Let's see how your ADHD brain performed today!",
          });
        }
        return newTime;
      });
      
      // Randomly change time speed to simulate time blindness
      if (Math.random() < 0.02 && !adhdSettings.isAccommodated && !activeSuperpower) {
        const speeds = [0.5, 0.8, 1, 1.5, 2];
        setTimeSpeed(speeds[Math.floor(Math.random() * speeds.length)]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeSpeed, adhdSettings.isAccommodated, activeSuperpower, gameEnded, toast]);

  // Track symptoms
  useEffect(() => {
    if (isExecutiveDysfunctionActive && !symptomsExperienced.includes('executive_dysfunction')) {
      setSymptomsExperienced(prev => [...prev, 'executive_dysfunction']);
    }
    if (isDistracted && !symptomsExperienced.includes('distractions')) {
      setSymptomsExperienced(prev => [...prev, 'distractions']);
    }
    if (sensoryOverload && !symptomsExperienced.includes('sensory_overload')) {
      setSymptomsExperienced(prev => [...prev, 'sensory_overload']);
    }
  }, [isExecutiveDysfunctionActive, isDistracted, sensoryOverload, symptomsExperienced]);

  // Random ADHD symptom triggers
  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    const symptomInterval = setInterval(() => {
      const symptomChance = adhdSettings.intensity / 10;
      
      if (Math.random() < symptomChance) {
        // Executive dysfunction
        if (Math.random() < 0.3) {
          setIsExecutiveDysfunctionActive(true);
          setTimeout(() => setIsExecutiveDysfunctionActive(false), 2000 + Math.random() * 3000);
        }
        
        // Sensory overload
        if (Math.random() < 0.2) {
          setSensoryOverload(true);
          setTimeout(() => setSensoryOverload(false), 1000 + Math.random() * 2000);
        }
      }
    }, 3000 + Math.random() * 7000);

    return () => clearInterval(symptomInterval);
  }, [adhdSettings]);

  // Hyperfocus trigger
  useEffect(() => {
    if (gameState.currentRow >= 3 && !adhdSettings.isHyperfocus && Math.random() < 0.3) {
      setADHDSettings(prev => ({ ...prev, isHyperfocus: true }));
      setTimeSpeed(1.5); // Time moves faster during hyperfocus
      toast({
        title: "🎯 Hyperfocus Activated!",
        description: "Distractions cleared. Time moves faster. You've got this!",
      });
      
      setTimeout(() => {
        setADHDSettings(prev => ({ ...prev, isHyperfocus: false }));
        setTimeSpeed(1);
      }, 30000 + Math.random() * 60000);
    }
  }, [gameState.currentRow, adhdSettings.isHyperfocus, toast]);

  // Handle Noro's active assistance
  const handleNoroAssist = (assistanceType: string, data?: any) => {
    setNoroAssistanceCount(prev => prev + 1);
    setNoroGuidance(data);

    switch (assistanceType) {
      case 'break_down_task':
        // Highlight specific keys or provide step-by-step guidance
        toast({
          title: "🎯 Step 1 of 3",
          description: data?.guidance || "Let's start with a vowel",
        });
        break;
        
      case 'pattern_highlight':
        // Suggest specific letters to try
        if (data?.suggestedLetters) {
          toast({
            title: "💡 Try these letters",
            description: `Suggested starting letters: ${data.suggestedLetters.join(', ')}`,
          });
        }
        break;
        
      case 'reduce_overwhelm':
        // Activate focus mode and reduce distractions
        setFocusMode(true);
        setIsDistracted(false);
        setSensoryOverload(false);
        if (data?.timeExtension) {
          setTimeElapsed(prev => Math.max(0, prev - data.timeExtension));
        }
        toast({
          title: "🧘 Focus mode activated",
          description: "Distractions reduced. You've got this!",
        });
        setTimeout(() => setFocusMode(false), 30000);
        break;
        
      case 'time_estimation':
        // Provide time awareness
        if (data?.checkpoints) {
          data.checkpoints.forEach((checkpoint: number, index: number) => {
            setTimeout(() => {
              toast({
                title: `⏱️ Checkpoint ${index + 1}`,
                description: `${checkpoint} seconds - you're on track!`,
              });
            }, checkpoint * 1000);
          });
        }
        break;
    }
  };

  const handleSuperpowerActivate = (type: string) => {
    setActiveSuperpower(type);
    setSuperpowersUsed(prev => [...prev, type]);
    
    if (type === 'hyperfocus_boost') {
      setADHDSettings(prev => ({ ...prev, isHyperfocus: true }));
      setIsDistracted(false);
      setSensoryOverload(false);
    } else if (type === 'time_clarity') {
      setTimeSpeed(1);
    }
  };

  const handleSuperpowerDeactivate = () => {
    setActiveSuperpower(null);
    if (activeSuperpower === 'hyperfocus_boost') {
      setADHDSettings(prev => ({ ...prev, isHyperfocus: false }));
    }
  };

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.isGameOver) return;
    
    // Noro assistance: reduce executive dysfunction delay when actively helping
    const baseDelay = isExecutiveDysfunctionActive ? 2000 + Math.random() * 1000 : 0;
    const assistanceReduction = noroGuidance ? 0.5 : 1; // 50% reduction if Noro is helping
    const delay = baseDelay * assistanceReduction;
    
    setTimeout(() => {
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
          
          // Clear Noro guidance after successful guess
          if (noroGuidance) {
            setNoroGuidance(null);
            toast({
              title: "🎉 Great work!",
              description: "Noro's guidance helped you make progress!",
            });
          }
          
          if (isWinner) {
            toast({
              title: "🎉 Amazing work!",
              description: `You found it in ${newGuesses.length} tries! Your brain is incredible.`,
            });
          } else if (isGameOver) {
            toast({
              title: "Good effort!",
              description: `The word was ${gameState.targetWord}. Every attempt teaches us something.`,
            });
          }
        }
      } else if (key === 'BACKSPACE') {
        setGameState(prev => ({
          ...prev,
          currentGuess: prev.currentGuess.slice(0, -1)
        }));
      } else if (key.length === 1 && gameState.currentGuess.length < 5) {
        // Noro assistance: reduce typing errors when actively helping
        let newGuess = gameState.currentGuess + key;
        const errorReduction = noroGuidance ? 0.02 : 0.1; // Lower error rate with Noro
        
        if (Math.random() < errorReduction && !adhdSettings.isAccommodated && newGuess.length >= 2) {
          const chars = newGuess.split('');
          [chars[chars.length - 1], chars[chars.length - 2]] = [chars[chars.length - 2], chars[chars.length - 1]];
          newGuess = chars.join('');
        }
        
        setGameState(prev => ({
          ...prev,
          currentGuess: newGuess
        }));
      }
    }, delay);
  }, [gameState, isExecutiveDysfunctionActive, adhdSettings.isAccommodated, toast, noroGuidance]);

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
    setTimeSpeed(1);
    setSuperpowersUsed([]);
    setSymptomsExperienced([]);
    setNoroAssistanceCount(0);
    setGameEnded(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen bg-background transition-all duration-500 ${sensoryOverload && !activeSuperpower && !focusMode ? 'animate-pulse' : ''}`}>
      <div className="container mx-auto max-w-lg p-4">
        {/* Header */}
        <header className="text-center py-4 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">ADHD Wordle</h1>
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Time: {formatTime(timeElapsed)}</span>
            <span className={timeRemaining < 60 ? 'text-red-500 font-bold' : ''}>
              Remaining: {formatTime(timeRemaining)}
            </span>
            <span>Attempt: {gameState.currentRow + 1}/6</span>
          </div>
          {focusMode && (
            <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              🧘 Noro Focus Mode Active
            </div>
          )}
        </header>

        {/* Show game summary if game is over */}
        {gameState.isGameOver ? (
          <div className="py-4 space-y-4">
            <GameSummary 
              gameState={gameState}
              adhdSettings={adhdSettings}
              timeElapsed={timeElapsed}
              superpowersUsed={superpowersUsed}
              symptomsExperienced={symptomsExperienced}
              noroAssistanceCount={noroAssistanceCount}
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
            <AccessibilityControls 
              settings={adhdSettings}
              onSettingsChange={setADHDSettings}
            />

            {/* Superpower Manager */}
            <SuperpowerManager 
              gameState={gameState}
              adhdSettings={adhdSettings}
              onSuperpowerActivate={handleSuperpowerActivate}
              onSuperpowerDeactivate={handleSuperpowerDeactivate}
            />

            {/* Main Game Area */}
            <div className="py-4 space-y-4">
              <GameGrid 
                gameState={gameState}
                adhdSettings={{
                  ...adhdSettings,
                  isHyperfocus: adhdSettings.isHyperfocus || activeSuperpower === 'hyperfocus_boost' || focusMode
                }}
                sensoryOverload={sensoryOverload && activeSuperpower !== 'hyperfocus_boost' && !focusMode}
              />
              
              <GameKeyboard 
                onKeyPress={handleKeyPress}
                gameState={gameState}
                isExecutiveDysfunctionActive={isExecutiveDysfunctionActive && activeSuperpower !== 'hyperfocus_boost' && !focusMode}
                adhdSettings={{
                  ...adhdSettings,
                  isHyperfocus: adhdSettings.isHyperfocus || activeSuperpower === 'hyperfocus_boost' || focusMode
                }}
              />
            </div>

            {/* Noro Assistant */}
            <NoroAssistant 
              gameState={gameState}
              adhdSettings={adhdSettings}
              timeRemaining={timeRemaining}
              onAssist={handleNoroAssist}
            />

            {/* ADHD Symptom Manager */}
            <SymptomManager 
              adhdSettings={{
                ...adhdSettings,
                isHyperfocus: adhdSettings.isHyperfocus || activeSuperpower === 'hyperfocus_boost' || focusMode
              }}
              gameState={gameState}
              onDistract={setIsDistracted}
            />

            {/* Distraction Layer */}
            <DistractionLayer 
              isActive={isDistracted && activeSuperpower !== 'hyperfocus_boost' && !focusMode}
              intensity={adhdSettings.intensity}
              onClose={() => setIsDistracted(false)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
