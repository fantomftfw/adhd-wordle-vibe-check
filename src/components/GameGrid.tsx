
import { useState, useEffect } from 'react';
import type { GameState, ADHDSettings } from '@/pages/Index';

interface GameGridProps {
  gameState: GameState;
  adhdSettings: ADHDSettings;
  sensoryOverload: boolean;
}

export const GameGrid = ({ gameState, adhdSettings, sensoryOverload }: GameGridProps) => {
  const [fadingRows, setFadingRows] = useState<Set<number>>(new Set());
  const [colorDelays, setColorDelays] = useState<{ [key: string]: boolean }>({});
  const [jumbledWords, setJumbledWords] = useState<{ [key: number]: string }>({});
  const [isJumbling, setIsJumbling] = useState<Set<number>>(new Set());

  // Working memory challenges - make previous guesses fade
  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.1 && gameState.guesses.length > 1) {
        const rowToFade = Math.floor(Math.random() * (gameState.guesses.length - 1));
        setFadingRows(prev => new Set([...prev, rowToFade]));
        
        setTimeout(() => {
          setFadingRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(rowToFade);
            return newSet;
          });
        }, 3000 + Math.random() * 5000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [gameState.guesses.length, adhdSettings]);

  // Word jumbling effect - rare but noticeable
  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus || gameState.guesses.length < 2) return;

    const jumbleInterval = setInterval(() => {
      // Very rare effect - 2-8% chance based on intensity
      const chance = (adhdSettings.intensity / 5) * 0.02 + 0.02; // 2% to 8%
      
      if (Math.random() < chance) {
        // Pick a random completed row to jumble
        const availableRows = Array.from({ length: gameState.guesses.length }, (_, i) => i);
        const rowToJumble = availableRows[Math.floor(Math.random() * availableRows.length)];
        const originalWord = gameState.guesses[rowToJumble];
        
        // Create a jumbled version
        const letters = originalWord.split('');
        for (let i = letters.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        const jumbledWord = letters.join('');
        
        // Set the jumbled state
        setJumbledWords(prev => ({ ...prev, [rowToJumble]: jumbledWord }));
        setIsJumbling(prev => new Set([...prev, rowToJumble]));
        
        // Restore original after a brief moment
        setTimeout(() => {
          setJumbledWords(prev => {
            const newState = { ...prev };
            delete newState[rowToJumble];
            return newState;
          });
          setIsJumbling(prev => {
            const newSet = new Set(prev);
            newSet.delete(rowToJumble);
            return newSet;
          });
        }, 800 + Math.random() * 1200); // 0.8-2 seconds
      }
    }, 25000 + Math.random() * 35000); // 25-60 seconds

    return () => clearInterval(jumbleInterval);
  }, [gameState.guesses.length, adhdSettings]);

  const getLetterStatus = (letter: string, position: number, word: string) => {
    if (word === gameState.targetWord) return 'correct';
    if (gameState.targetWord.includes(letter)) {
      if (gameState.targetWord[position] === letter) return 'correct';
      return 'present';
    }
    return 'absent';
  };

  const renderRow = (guess: string, rowIndex: number, isCurrentRow: boolean = false) => {
    const cells = [];
    
    // Use jumbled word if this row is currently jumbling
    const displayWord = isJumbling.has(rowIndex) && jumbledWords[rowIndex] 
      ? jumbledWords[rowIndex] 
      : guess;
    
    for (let i = 0; i < 5; i++) {
      const letter = isCurrentRow ? gameState.currentGuess[i] || '' : displayWord[i] || '';
      const cellKey = `${rowIndex}-${i}`;
      
      let cellClass = 'w-12 h-12 border-2 border-border flex items-center justify-center text-lg font-bold transition-all duration-300 ';
      
      // Apply ADHD visual effects
      if (sensoryOverload) {
        cellClass += 'animate-pulse border-destructive ';
      }
      
      if (fadingRows.has(rowIndex)) {
        cellClass += 'opacity-30 ';
      }

      // Add jumbling animation
      if (isJumbling.has(rowIndex)) {
        cellClass += 'animate-pulse bg-yellow-100 ';
      }

      if (!isCurrentRow && letter) {
        // For color feedback, use the original word position for status calculation
        const originalLetter = guess[i] || '';
        const status = getLetterStatus(originalLetter, i, guess);
        
        // Color feedback delay simulation
        const hasColorDelay = colorDelays[cellKey];
        if (hasColorDelay) {
          cellClass += 'bg-muted ';
        } else {
          switch (status) {
            case 'correct':
              cellClass += 'bg-green-500 text-white border-green-500 ';
              break;
            case 'present':
              cellClass += 'bg-yellow-500 text-white border-yellow-500 ';
              break;
            case 'absent':
              cellClass += 'bg-gray-500 text-white border-gray-500 ';
              break;
          }
        }
        
        // Randomly trigger color delays
        if (Math.random() < 0.1 && !adhdSettings.isAccommodated) {
          setColorDelays(prev => ({ ...prev, [cellKey]: true }));
          setTimeout(() => {
            setColorDelays(prev => {
              const newDelays = { ...prev };
              delete newDelays[cellKey];
              return newDelays;
            });
          }, 1000 + Math.random() * 2000);
        }
      } else if (isCurrentRow && letter) {
        cellClass += 'border-foreground ';
      }

      // Font size flickering for sensory processing issues
      const fontSize = sensoryOverload && Math.random() < 0.3 ? 
        'text-xs' : Math.random() < 0.05 && !adhdSettings.isAccommodated ? 
        'text-xl' : 'text-lg';

      cells.push(
        <div
          key={cellKey}
          className={cellClass + fontSize}
          style={{
            transform: sensoryOverload ? `rotate(${(Math.random() - 0.5) * 2}deg)` : 
                      isJumbling.has(rowIndex) ? `translateX(${(Math.random() - 0.5) * 4}px)` : 'none'
          }}
        >
          {letter}
        </div>
      );
    }
    
    return (
      <div key={rowIndex} className="flex gap-1 justify-center">
        {cells}
      </div>
    );
  };

  const rows = [];
  
  // Render completed guesses
  for (let i = 0; i < gameState.guesses.length; i++) {
    rows.push(renderRow(gameState.guesses[i], i));
  }
  
  // Render current guess row
  if (!gameState.isGameOver) {
    rows.push(renderRow('', gameState.currentRow, true));
  }
  
  // Render empty rows
  for (let i = rows.length; i < 6; i++) {
    rows.push(renderRow('', i));
  }

  return (
    <div className="space-y-1 py-4">
      {rows}
      
      {/* Hyperfocus indicator */}
      {adhdSettings.isHyperfocus && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            🎯 Hyperfocus Mode Active
          </div>
        </div>
      )}
    </div>
  );
};
