import { useEffect } from 'react';
import type { GameState } from '@/pages/Game';

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
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export const GameKeyboard = ({
  onKeyPress,
  gameState,
  frozen,
  revealLetters,
  targetWord,
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
    const isTargetLetter = targetWord?.includes(key) ?? false;

    let keyClass =
      'px-3 py-4 rounded font-semibold transition-all duration-200 touch-manipulation focus:outline-none ';

    // Base styling
    if (key === 'ENTER' || key === 'BACKSPACE') {
      keyClass += 'px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 ';
    } else {
      keyClass += 'bg-gray-200 text-gray-800 hover:bg-gray-300 ';
    }

    // Power-up: reveal letters effect - hide 70% of incorrect letters
    if (revealLetters && key !== 'ENTER' && key !== 'BACKSPACE') {
      if (!isTargetLetter) {
        // Generate a deterministic random for this key to ensure consistency
        const keyHash = key.charCodeAt(0);
        const shouldHide = keyHash % 10 < 7; // 70% chance to hide

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
      keyClass += 'opacity-60 cursor-not-allowed ';
    }

    return (
      <button
        role="button"
        aria-label={key}
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
