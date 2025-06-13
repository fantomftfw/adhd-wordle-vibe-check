
import { Clock, Zap, Eye, Star } from 'lucide-react';
import type { GameState } from '@/pages/Game';

interface GameSummaryProps {
  gameState: GameState;
  timeElapsed: number;
  correctWord: string;
}

export const GameSummary = ({ 
  gameState, 
  timeElapsed, 
  correctWord 
}: GameSummaryProps) => {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-card-foreground mb-2">
          {gameState.isWinner ? '🎉 Congratulations!' : '🌟 Good Effort!'}
        </h2>
        <p className="text-lg font-semibold text-muted-foreground mb-1">
          The word was: <span className="text-primary font-bold">{correctWord}</span>
        </p>
        <p className="text-muted-foreground">
          {gameState.isWinner ? 'You found it!' : 'Better luck next time!'}
        </p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{gameState.guesses.length}</div>
          <div className="text-sm text-muted-foreground">Attempts Used</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{minutes}:{seconds.toString().padStart(2, '0')}</div>
          <div className="text-sm text-muted-foreground">Time Taken</div>
        </div>
      </div>

      {/* Positive Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
        <h3 className="font-semibold text-green-800 mb-1">Great Job Playing!</h3>
        <div className="text-green-700 text-sm">
          <div>✨ You showed persistence and focus</div>
          <div>🧠 Every attempt helps you learn patterns</div>
          <div>🎯 You navigated the challenges well</div>
        </div>
      </div>
    </div>
  );
};
