
import { useEffect } from 'react';
import type { GameState } from '@/pages/Index';

interface GameKeyboardProps {
  onKeyPress: (key: string) => void;
  gameState: GameState;
  frozen: boolean;
  revealLetters: boolean;
  targetWord: string;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const GameKeyboard = ({ 
  onKeyPress, 
  gameState, 
  frozen,
  revealLetters,
  targetWord
}: GameKeyboardProps) => {
  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (frozen) return;
      
      const key = e.key.toUpperCase();
      
      if (key === 'ENTER' || key === 'BACKSPACE') {
        onKeyPress(key);
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        onKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, frozen]);

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

  const renderKey = (key: string) => {
    const status = getKeyStatus(key);
    const isTargetLetter = targetWord.includes(key);
    
    let keyClass = 'px-3 py-4 rounded font-semibold transition-all duration-200 touch-manipulation ';
    
    // Base styling
    if (key === 'ENTER' || key === 'BACKSPACE') {
      keyClass += 'px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 ';
    } else {
      keyClass += 'bg-muted text-muted-foreground hover:bg-muted/80 ';
    }
    
    // Power-up: reveal letters effect
    if (revealLetters && key !== 'ENTER' && key !== 'BACKSPACE') {
      if (!isTargetLetter) {
        keyClass += 'opacity-30 bg-gray-200 ';
      } else {
        keyClass += 'ring-2 ring-blue-400 bg-blue-50 ';
      }
    }
    
    // Status colors (only if not in reveal mode or if it's a target letter)
    if (!revealLetters || isTargetLetter) {
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
    }
    
    // Frozen state
    if (frozen) {
      keyClass += 'opacity-50 cursor-not-allowed ';
    }

    return (
      <button
        key={key}
        onClick={() => !frozen && onKeyPress(key)}
        disabled={frozen}
        className={keyClass}
      >
        {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '↵' : key}
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
    </div>
  );
};
