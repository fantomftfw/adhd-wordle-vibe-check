
import { useState, useEffect, useCallback } from 'react';
import type { GameState } from '@/pages/Index';

interface GameGridProps {
  gameState: GameState;
  colorBlindness: boolean;
  hyperfocusMode: boolean;
}

export const GameGrid = ({ gameState, colorBlindness, hyperfocusMode }: GameGridProps) => {
  const getLetterStatus = useCallback((letter: string, position: number, word: string) => {
    if (gameState.targetWord[position] === letter) return 'correct';
    if (gameState.targetWord.includes(letter)) return 'present';
    return 'absent';
  }, [gameState.targetWord]);

  const renderRow = (guess: string, rowIndex: number, isCurrentRow: boolean = false) => {
    const cells = [];
    
    for (let i = 0; i < 5; i++) {
      const letter = isCurrentRow ? gameState.currentGuess[i] || '' : guess[i] || '';
      
      let cellClass = 'w-12 h-12 border-2 border-border flex items-center justify-center text-lg font-bold transition-all duration-300 ';
      
      if (hyperfocusMode) {
        cellClass += 'ring-2 ring-blue-400 ';
      }

      if (!isCurrentRow && letter && !colorBlindness) {
        const status = getLetterStatus(letter, i, guess);
        
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
      } else if (isCurrentRow && letter) {
        cellClass += 'border-foreground ';
      } else if (!isCurrentRow && letter && colorBlindness) {
        cellClass += 'bg-gray-300 text-gray-700 border-gray-300 ';
      }

      cells.push(
        <div key={`${rowIndex}-${i}`} className={cellClass}>
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
      
      {hyperfocusMode && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            🎯 Hyperfocus Mode Active
          </div>
        </div>
      )}
    </div>
  );
};
