
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Zap, Eye, Star, Clock } from 'lucide-react';
import type { GameState, ADHDSettings } from '@/pages/Index';

interface SuperpowerManagerProps {
  gameState: GameState;
  adhdSettings: ADHDSettings;
  onSuperpowerActivate: (type: string) => void;
  onSuperpowerDeactivate: () => void;
}

interface Superpower {
  type: string;
  name: string;
  description: string;
  icon: typeof Zap;
  duration: number;
  rarity: number; // 0-1, lower = rarer
}

const SUPERPOWERS: Superpower[] = [
  {
    type: 'hyperfocus_boost',
    name: 'Hyperfocus Surge',
    description: 'All distractions disappear! Pure focus mode activated.',
    icon: Zap,
    duration: 15000, // 15 seconds
    rarity: 0.3
  },
  {
    type: 'pattern_vision',
    name: 'Pattern Vision',
    description: 'Your brain highlights letter patterns and common combinations!',
    icon: Eye,
    duration: 20000, // 20 seconds
    rarity: 0.4
  },
  {
    type: 'intuition_boost',
    name: 'Intuition Boost',
    description: 'A helpful hint about the word appears!',
    icon: Star,
    duration: 10000, // 10 seconds
    rarity: 0.5
  },
  {
    type: 'time_clarity',
    name: 'Time Clarity',
    description: 'Time perception normalizes and you see exactly how much time you have.',
    icon: Clock,
    duration: 25000, // 25 seconds
    rarity: 0.2
  }
];

export const SuperpowerManager = ({ 
  gameState, 
  adhdSettings, 
  onSuperpowerActivate, 
  onSuperpowerDeactivate 
}: SuperpowerManagerProps) => {
  const { toast } = useToast();
  const [activeSuperpower, setActiveSuperpower] = useState<Superpower | null>(null);
  const [superpowerHistory, setSuperpowerHistory] = useState<string[]>([]);

  // Random superpower activation
  useEffect(() => {
    if (adhdSettings.isAccommodated || activeSuperpower) return;

    const superpowerInterval = setInterval(() => {
      // Higher chance as game progresses
      const progressBonus = gameState.currentRow * 0.02;
      const chance = 0.03 + progressBonus; // 3-15% chance based on progress
      
      if (Math.random() < chance) {
        // Select random superpower based on rarity
        const availableSuperpowers = SUPERPOWERS.filter(sp => Math.random() < sp.rarity);
        if (availableSuperpowers.length > 0) {
          const superpower = availableSuperpowers[Math.floor(Math.random() * availableSuperpowers.length)];
          activateSuperpower(superpower);
        }
      }
    }, 20000 + Math.random() * 40000); // 20-60 seconds

    return () => clearInterval(superpowerInterval);
  }, [gameState.currentRow, adhdSettings.isAccommodated, activeSuperpower]);

  const activateSuperpower = (superpower: Superpower) => {
    setActiveSuperpower(superpower);
    setSuperpowerHistory(prev => [...prev, superpower.type]);
    onSuperpowerActivate(superpower.type);

    const IconComponent = superpower.icon;
    
    toast({
      title: `⚡ ${superpower.name} Activated!`,
      description: superpower.description,
    });

    // Show hint for intuition boost
    if (superpower.type === 'intuition_boost') {
      setTimeout(() => {
        const hints = [
          `The word contains the letter "${gameState.targetWord[Math.floor(Math.random() * 5)]}"`,
          `This word is related to ${getWordCategory(gameState.targetWord)}`,
          `The word ${gameState.targetWord.length > 4 ? 'is longer than 4 letters' : 'is exactly 5 letters'}`,
          `Try thinking of words that rhyme with common words`
        ];
        const hint = hints[Math.floor(Math.random() * hints.length)];
        
        toast({
          title: "💡 Intuition Hint",
          description: hint,
        });
      }, 2000);
    }

    // Deactivate after duration
    setTimeout(() => {
      setActiveSuperpower(null);
      onSuperpowerDeactivate();
      
      toast({
        title: `${superpower.name} ended`,
        description: "Back to normal difficulty",
      });
    }, superpower.duration);
  };

  const getWordCategory = (word: string) => {
    const categories = ['emotions', 'actions', 'objects', 'nature', 'abstract concepts'];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  return (
    <div className="text-center">
      {activeSuperpower && (
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm animate-pulse border-2 border-yellow-300">
          <activeSuperpower.icon className="w-4 h-4" />
          {activeSuperpower.name} Active
        </div>
      )}
      
      {superpowerHistory.length > 0 && !activeSuperpower && (
        <div className="text-xs text-muted-foreground mt-1">
          Superpowers used: {superpowerHistory.length}
        </div>
      )}
    </div>
  );
};

export { SUPERPOWERS };
export type { Superpower };
