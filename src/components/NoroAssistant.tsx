
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Zap, Clock, Brain, Target } from 'lucide-react';
import type { GameState, ADHDSettings } from '@/pages/Index';

interface NoroAssistantProps {
  gameState: GameState;
  adhdSettings: ADHDSettings;
  timeRemaining: number;
  onAssist: (assistanceType: string, data?: any) => void;
}

interface NoroIntervention {
  type: 'break_down_task' | 'time_estimation' | 'focus_boost' | 'pattern_highlight' | 'reduce_overwhelm';
  trigger: string;
  message: string;
  action: () => void;
}

export const NoroAssistant = ({ gameState, adhdSettings, timeRemaining, onAssist }: NoroAssistantProps) => {
  const { toast } = useToast();
  const [lastAssistance, setLastAssistance] = useState<number>(0);
  const [assistanceCount, setAssistanceCount] = useState(0);
  const [activeIntervention, setActiveIntervention] = useState<string | null>(null);

  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    const now = Date.now();
    if (now - lastAssistance < 30000) return; // 30 second cooldown

    let shouldIntervene = false;
    let intervention: NoroIntervention | null = null;

    // Executive dysfunction - break down the task
    if (gameState.currentGuess.length === 0 && gameState.guesses.length < 2 && Math.random() < 0.4) {
      intervention = {
        type: 'break_down_task',
        trigger: 'executive_dysfunction',
        message: "I'm breaking this down for you: First, let's just type ANY letter. Then we'll build from there.",
        action: () => {
          onAssist('break_down_task', { 
            step: 1, 
            guidance: 'Just pick a vowel: A, E, I, O, or U',
            highlight: 'vowels'
          });
          setActiveIntervention('break_down_task');
          setTimeout(() => setActiveIntervention(null), 15000);
        }
      };
      shouldIntervene = true;
    }

    // Stuck pattern - actively change approach
    if (gameState.guesses.length >= 2) {
      const lastTwo = gameState.guesses.slice(-2);
      if (lastTwo[0][0] === lastTwo[1][0] && Math.random() < 0.6) {
        intervention = {
          type: 'pattern_highlight',
          trigger: 'stuck_pattern',
          message: "I'm highlighting different letter combinations for you. Let's try a completely different starting letter.",
          action: () => {
            const usedFirstLetters = gameState.guesses.map(g => g[0]);
            const availableLetters = 'BCDFGHJKLMNPQRSTVWXYZ'.split('').filter(l => !usedFirstLetters.includes(l));
            onAssist('pattern_highlight', { 
              suggestedLetters: availableLetters.slice(0, 3),
              avoid: usedFirstLetters
            });
            setActiveIntervention('pattern_highlight');
            setTimeout(() => setActiveIntervention(null), 20000);
          }
        };
        shouldIntervene = true;
      }
    }

    // Time pressure - reduce overwhelm
    if (timeRemaining < 120 && gameState.guesses.length >= 3 && Math.random() < 0.5) {
      intervention = {
        type: 'reduce_overwhelm',
        trigger: 'time_pressure',
        message: "Time pressure detected. I'm dimming distractions and focusing only on what matters.",
        action: () => {
          onAssist('reduce_overwhelm', { 
            focusMode: true,
            timeExtension: 30
          });
          setActiveIntervention('reduce_overwhelm');
          setTimeout(() => setActiveIntervention(null), 30000);
        }
      };
      shouldIntervene = true;
    }

    // Provide time estimation
    if (gameState.currentRow === 1 && Math.random() < 0.3) {
      intervention = {
        type: 'time_estimation',
        trigger: 'time_awareness',
        message: "Based on your progress, I estimate you need about 90 seconds for your next guess. I'll help you stay on track.",
        action: () => {
          onAssist('time_estimation', { 
            estimatedTime: 90,
            checkpoints: [30, 60, 90]
          });
          setActiveIntervention('time_estimation');
          setTimeout(() => setActiveIntervention(null), 90000);
        }
      };
      shouldIntervene = true;
    }

    if (shouldIntervene && intervention) {
      toast({
        title: "🤖 Noro is helping!",
        description: intervention.message,
      });

      // Execute the intervention
      intervention.action();

      setLastAssistance(now);
      setAssistanceCount(prev => prev + 1);
    }
  }, [gameState.guesses, gameState.currentGuess, timeRemaining, adhdSettings, toast, lastAssistance, onAssist]);

  // Proactive encouragement based on progress
  useEffect(() => {
    if (gameState.currentRow === 3 && assistanceCount === 0) {
      toast({
        title: "🎯 Noro observes",
        description: "You're doing great! Your pattern recognition is working well.",
      });
    }
  }, [gameState.currentRow, assistanceCount, toast]);

  return (
    <div className="text-center mt-2">
      {activeIntervention && (
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm animate-pulse border-2 border-blue-300">
          <Brain className="w-4 h-4" />
          Noro actively assisting
        </div>
      )}
      
      {assistanceCount > 0 && !activeIntervention && (
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
          <Zap className="w-3 h-3" />
          Noro helped {assistanceCount} time{assistanceCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
