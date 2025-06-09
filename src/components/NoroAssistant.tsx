
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Zap, Clock } from 'lucide-react';
import type { GameState, ADHDSettings } from '@/pages/Index';

interface NoroAssistantProps {
  gameState: GameState;
  adhdSettings: ADHDSettings;
  timeRemaining: number;
}

const NORO_TIPS = [
  {
    trigger: 'executive_dysfunction',
    message: "Hey! I notice you're having trouble starting. Let's break this down: First, look at the letters you know. Then pick just ONE position to focus on.",
    timeEstimate: "This should take about 30 seconds"
  },
  {
    trigger: 'stuck_pattern',
    message: "I see you're trying similar patterns. Let's shift approach: Think of a completely different word category - maybe animals or colors?",
    timeEstimate: "Give yourself 1 minute to explore this new direction"
  },
  {
    trigger: 'time_pressure',
    message: "Time is getting tight, but you've got this! Focus on the letters you KNOW are correct and build around them.",
    timeEstimate: "You need about 2 minutes for your remaining guesses"
  },
  {
    trigger: 'sensory_overload',
    message: "Feeling overwhelmed? Take a deep breath. Cover the previous guesses with your hand and focus only on the current row.",
    timeEstimate: "30 seconds to reset, then back to the puzzle"
  }
];

export const NoroAssistant = ({ gameState, adhdSettings, timeRemaining }: NoroAssistantProps) => {
  const { toast } = useToast();
  const [lastAssistance, setLastAssistance] = useState<number>(0);
  const [assistanceCount, setAssistanceCount] = useState(0);

  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    const now = Date.now();
    if (now - lastAssistance < 30000) return; // 30 second cooldown

    let shouldAssist = false;
    let assistanceType = '';

    // Detect if user is stuck (same first letter multiple times)
    if (gameState.guesses.length >= 2) {
      const lastTwo = gameState.guesses.slice(-2);
      if (lastTwo[0][0] === lastTwo[1][0] && Math.random() < 0.6) {
        shouldAssist = true;
        assistanceType = 'stuck_pattern';
      }
    }

    // Time pressure assistance
    if (timeRemaining < 120 && gameState.guesses.length >= 3 && Math.random() < 0.4) {
      shouldAssist = true;
      assistanceType = 'time_pressure';
    }

    // Executive dysfunction (no guesses for a while)
    if (gameState.currentGuess.length === 0 && gameState.guesses.length < 2 && Math.random() < 0.3) {
      shouldAssist = true;
      assistanceType = 'executive_dysfunction';
    }

    if (shouldAssist) {
      const tip = NORO_TIPS.find(t => t.trigger === assistanceType) || NORO_TIPS[0];
      
      toast({
        title: "🤖 Noro here!",
        description: tip.message,
      });

      setTimeout(() => {
        toast({
          title: "⏱️ Time estimate",
          description: tip.timeEstimate,
        });
      }, 2000);

      setLastAssistance(now);
      setAssistanceCount(prev => prev + 1);
    }
  }, [gameState.guesses, gameState.currentGuess, timeRemaining, adhdSettings, toast, lastAssistance]);

  return (
    <div className="text-center mt-2">
      {assistanceCount > 0 && (
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
          <Zap className="w-3 h-3" />
          Noro assisted {assistanceCount} time{assistanceCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
