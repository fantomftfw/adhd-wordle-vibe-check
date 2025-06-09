
import { useState, useEffect } from 'react';
import type { GameState, ADHDSettings } from '@/pages/Index';

interface GameKeyboardProps {
  onKeyPress: (key: string) => void;
  gameState: GameState;
  isExecutiveDysfunctionActive: boolean;
  adhdSettings: ADHDSettings;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const GameKeyboard = ({ 
  onKeyPress, 
  gameState, 
  isExecutiveDysfunctionActive,
  adhdSettings 
}: GameKeyboardProps) => {
  const [movingButton, setMovingButton] = useState<string | null>(null);
  const [flickeringKeys, setFlickeringKeys] = useState<Set<string>>(new Set());

  // Task switching simulation - briefly show different letters
  const [taskSwitchActive, setTaskSwitchActive] = useState(false);
  const [originalKey, setOriginalKey] = useState<string>('');

  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    // Random key flickering for sensory processing
    const flickerInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        const allKeys = KEYBOARD_ROWS.flat();
        const keyToFlicker = allKeys[Math.floor(Math.random() * allKeys.length)];
        setFlickeringKeys(prev => new Set([...prev, keyToFlicker]));
        
        setTimeout(() => {
          setFlickeringKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(keyToFlicker);
            return newSet;
          });
        }, 200 + Math.random() * 500);
      }
    }, 2000);

    // Task switching
    const taskSwitchInterval = setInterval(() => {
      if (Math.random() < 0.05) {
        setTaskSwitchActive(true);
        setTimeout(() => setTaskSwitchActive(false), 1000 + Math.random() * 2000);
      }
    }, 10000);

    return () => {
      clearInterval(flickerInterval);
      clearInterval(taskSwitchInterval);
    };
  }, [adhdSettings]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      
      if (key === 'ENTER' || key === 'BACKSPACE') {
        onKeyPress(key);
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        onKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const getKeyStatus = (key: string) => {
    if (key === 'ENTER' || key === 'BACKSPACE') return '';
    
    for (const guess of gameState.guesses) {
      if (guess.includes(key)) {
        for (let i = 0; i < guess.length; i++) {
          if (guess[i] === key) {
            if (gameState.targetWord[i] === key) return 'correct';
            if (gameState.targetWord.includes(key)) return 'present';
            return 'absent';
          }
        }
      }
    }
    return '';
  };

  const handleKeyClick = (key: string) => {
    // Executive dysfunction - button moves when trying to click
    if (isExecutiveDysfunctionActive && Math.random() < 0.4) {
      setMovingButton(key);
      setTimeout(() => {
        setMovingButton(null);
        onKeyPress(key);
      }, 500 + Math.random() * 1000);
      return;
    }
    
    onKeyPress(key);
  };

  const renderKey = (key: string) => {
    const status = getKeyStatus(key);
    const isFlickering = flickeringKeys.has(key);
    const isMoving = movingButton === key;
    
    let keyClass = 'px-3 py-4 rounded font-semibold transition-all duration-200 touch-manipulation ';
    
    // Base styling
    if (key === 'ENTER' || key === 'BACKSPACE') {
      keyClass += 'px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 ';
    } else {
      keyClass += 'bg-muted text-muted-foreground hover:bg-muted/80 ';
    }
    
    // Status colors
    switch (status) {
      case 'correct':
        keyClass += 'bg-green-500 text-white hover:bg-green-600 ';
        break;
      case 'present':
        keyClass += 'bg-yellow-500 text-white hover:bg-yellow-600 ';
        break;
      case 'absent':
        keyClass += 'bg-gray-500 text-white hover:bg-gray-600 ';
        break;
    }
    
    // ADHD effects
    if (isFlickering) {
      keyClass += 'animate-pulse border-2 border-destructive ';
    }
    
    if (isExecutiveDysfunctionActive) {
      keyClass += 'opacity-60 cursor-wait ';
    }
    
    const displayKey = taskSwitchActive && Math.random() < 0.3 ? 
      String.fromCharCode(65 + Math.floor(Math.random() * 26)) : key;

    return (
      <button
        key={key}
        onClick={() => handleKeyClick(key)}
        disabled={isMoving}
        className={keyClass}
        style={{
          transform: isMoving ? `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 10}px)` : 'none',
          fontSize: isFlickering && Math.random() < 0.5 ? '0.75rem' : '0.875rem'
        }}
      >
        {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '↵' : displayKey}
      </button>
    );
  };

  return (
    <div className="space-y-2">
      {KEYBOARD_ROWS.map((row, index) => (
        <div key={index} className="flex gap-1 justify-center">
          {row.map(renderKey)}
        </div>
      ))}
      
      {/* Executive dysfunction indicator */}
      {isExecutiveDysfunctionActive && (
        <div className="text-center text-sm text-muted-foreground mt-2">
          <div className="inline-flex items-center gap-2">
            ⏳ Brain processing...
          </div>
        </div>
      )}
    </div>
  );
};
