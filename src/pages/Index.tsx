
import { useState, useEffect, useCallback } from 'react';
import { GameGrid } from '@/components/GameGrid';
import { GameKeyboard } from '@/components/GameKeyboard';
import { DistractionLayer } from '@/components/DistractionLayer';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { SymptomManager } from '@/components/SymptomManager';
import { useToast } from '@/hooks/use-toast';

const WORD_LIST = ['FOCUS', 'BRAIN', 'CHAOS', 'SPARK', 'DRIFT', 'STORM', 'PEACE', 'BURST', 'GLOW', 'RUSH'];

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

  // Time blindness effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + timeSpeed);
      
      // Randomly change time speed to simulate time blindness
      if (Math.random() < 0.02 && !adhdSettings.isAccommodated) {
        const speeds = [0.5, 0.8, 1, 1.5, 2];
        setTimeSpeed(speeds[Math.floor(Math.random() * speeds.length)]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeSpeed, adhdSettings.isAccommodated]);

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

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.isGameOver) return;
    
    // Executive dysfunction delay
    const delay = isExecutiveDysfunctionActive ? 2000 + Math.random() * 1000 : 0;
    
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
        // Sometimes letters type in wrong order (ADHD symptom)
        let newGuess = gameState.currentGuess + key;
        if (Math.random() < 0.1 && !adhdSettings.isAccommodated && newGuess.length >= 2) {
          // Swap last two characters
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
  }, [gameState, isExecutiveDysfunctionActive, adhdSettings.isAccommodated, toast]);

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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen bg-background transition-all duration-500 ${sensoryOverload ? 'animate-pulse' : ''}`}>
      <div className="container mx-auto max-w-lg p-4">
        {/* Header */}
        <header className="text-center py-4 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">ADHD Wordle</h1>
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Time: {formatTime(timeElapsed)}</span>
            <span>Attempt: {gameState.currentRow + 1}/6</span>
          </div>
        </header>

        {/* Accessibility Controls */}
        <AccessibilityControls 
          settings={adhdSettings}
          onSettingsChange={setADHDSettings}
        />

        {/* Main Game Area */}
        <div className="py-4 space-y-4">
          <GameGrid 
            gameState={gameState}
            adhdSettings={adhdSettings}
            sensoryOverload={sensoryOverload}
          />
          
          <GameKeyboard 
            onKeyPress={handleKeyPress}
            gameState={gameState}
            isExecutiveDysfunctionActive={isExecutiveDysfunctionActive}
            adhdSettings={adhdSettings}
          />
        </div>

        {/* Game Over Actions */}
        {gameState.isGameOver && (
          <div className="text-center py-4">
            <button
              onClick={resetGame}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* ADHD Symptom Manager */}
        <SymptomManager 
          adhdSettings={adhdSettings}
          gameState={gameState}
          onDistract={setIsDistracted}
        />

        {/* Distraction Layer */}
        <DistractionLayer 
          isActive={isDistracted && !adhdSettings.isHyperfocus}
          intensity={adhdSettings.intensity}
          onClose={() => setIsDistracted(false)}
        />
      </div>
    </div>
  );
};

export default Index;
