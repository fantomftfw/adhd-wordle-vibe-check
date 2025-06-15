
import { useEffect } from 'react';
import type { GameState } from '@/pages/Index';

interface GameKeyboardProps {
  onKeyPress: (key: string) => void;
  gameState: GameState;
  frozen: boolean;
  revealLetters?: boolean;
  targetWord?: string;
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

  const renderKey = (key: string) => {
    const isTargetLetter = targetWord.includes(key);
    
    let keyClass = 'h-10 sm:h-12 px-2 sm:px-3 rounded font-semibold text-xs sm:text-base transition-all duration-200 touch-manipulation flex items-center justify-center ';
    
    // Base styling
    if (key === 'ENTER' || key === 'BACKSPACE') {
      keyClass += 'flex-grow sm:flex-grow-0 px-3 sm:px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 ';
    } else {
      keyClass += 'bg-muted text-muted-foreground hover:bg-muted/80 ';
    }
    
    // Power-up: reveal letters effect - hide 70% of incorrect letters
    if (revealLetters && key !== 'ENTER' && key !== 'BACKSPACE') {
      if (!isTargetLetter) {
        // Generate a deterministic random for this key to ensure consistency
        const keyHash = key.charCodeAt(0);
        const shouldHide = (keyHash % 10) < 7; // 70% chance to hide
        
        if (shouldHide) {
          keyClass += 'opacity-20 scale-90 ';
        } else {
          keyClass += 'opacity-60 ';
        }
      } else {
        keyClass += 'ring-2 ring-blue-400 bg-blue-100 text-blue-800 ';
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
    <div className="space-y-1 sm:space-y-2">
      {KEYBOARD_ROWS.map((row, index) => (
        <div key={index} className="flex gap-0.5 sm:gap-1 justify-center">
          {row.map(renderKey)}
        </div>
      ))}
    </div>
  );
};
