
import { Clock, Zap, Eye, Star } from 'lucide-react';
import type { GameState, ADHDSettings } from '@/pages/Index';

interface GameSummaryProps {
  gameState: GameState;
  adhdSettings: ADHDSettings;
  timeElapsed: number;
  superpowersUsed: string[];
  symptomsExperienced: string[];
  noroAssistanceCount: number;
}

const SYMPTOM_EXPLANATIONS = {
  'executive_dysfunction': 'Executive Dysfunction - Difficulty starting tasks and following through',
  'distractions': 'Distractibility - Attention pulled to unrelated thoughts',
  'sensory_overload': 'Sensory Processing - Overwhelm from visual/audio input',
  'working_memory': 'Working Memory - Trouble holding information in mind',
  'time_blindness': 'Time Blindness - Difficulty estimating time passage',
  'task_switching': 'Task Switching - Involuntary jumping between mental tasks'
};

const SUPERPOWER_BENEFITS = {
  'hyperfocus_boost': 'Eliminated all distractions and improved focus',
  'pattern_vision': 'Enhanced pattern recognition abilities',
  'intuition_boost': 'Provided helpful hints and insights',
  'time_clarity': 'Normalized time perception and awareness'
};

export const GameSummary = ({ 
  gameState, 
  adhdSettings, 
  timeElapsed, 
  superpowersUsed, 
  symptomsExperienced,
  noroAssistanceCount 
}: GameSummaryProps) => {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-card-foreground mb-2">
          {gameState.isWinner ? '🎉 Awesome Work!' : '🌟 Great Effort!'}
        </h2>
        <p className="text-muted-foreground">
          Your ADHD brain is unique and powerful!
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

      {/* ADHD Experience Summary */}
      <div className="space-y-3">
        <h3 className="font-semibold text-card-foreground flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Your ADHD Experience Today
        </h3>
        
        {symptomsExperienced.length > 0 ? (
          <div className="space-y-2">
            {symptomsExperienced.map((symptom, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="font-medium text-blue-800 text-sm">
                  {SYMPTOM_EXPLANATIONS[symptom as keyof typeof SYMPTOM_EXPLANATIONS] || symptom}
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  This is a common ADHD experience - you're not alone!
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded p-3">
            You had a smooth brain day! Sometimes the stars align perfectly. 🌟
          </p>
        )}
      </div>

      {/* Superpowers & Support */}
      {(superpowersUsed.length > 0 || noroAssistanceCount > 0) && (
        <div className="space-y-3">
          <h3 className="font-semibold text-card-foreground flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Support That Helped You
          </h3>
          
          {superpowersUsed.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Superpowers Activated:</h4>
              {superpowersUsed.map((power, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <div className="text-yellow-800 text-sm font-medium">
                    {power.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-yellow-600 text-xs">
                    {SUPERPOWER_BENEFITS[power as keyof typeof SUPERPOWER_BENEFITS]}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {noroAssistanceCount > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <div className="text-purple-800 text-sm font-medium">
                🤖 Noro assisted you {noroAssistanceCount} time{noroAssistanceCount !== 1 ? 's' : ''}
              </div>
              <div className="text-purple-600 text-xs">
                Breaking down tasks and providing time estimates helped manage overwhelm
              </div>
            </div>
          )}
        </div>
      )}

      {/* Positive Reinforcement */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
        <h3 className="font-semibold text-green-800 mb-1">ADHD Strengths Shown</h3>
        <div className="text-green-700 text-sm space-y-1">
          <div>✨ Creative problem-solving approach</div>
          <div>🎯 Persistence in face of challenges</div>
          <div>🧠 Unique pattern recognition abilities</div>
          {gameState.isWinner && <div>🏆 Task completion despite obstacles</div>}
        </div>
      </div>

      {/* Understanding Message */}
      <div className="text-center text-sm text-muted-foreground italic border-t pt-4">
        "Every ADHD brain experiences symptoms differently. What you experienced today 
        is valid, and the strategies that helped you can be used in real life too!"
      </div>
    </div>
  );
};
