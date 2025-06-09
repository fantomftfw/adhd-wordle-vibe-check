
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { GameState, ADHDSettings } from '@/pages/Index';

interface SymptomManagerProps {
  adhdSettings: ADHDSettings;
  gameState: GameState;
  onDistract: (isDistracted: boolean) => void;
}

const CREATIVE_HINTS = [
  "🌟 Creative insight: What if the word rhymes with something you know?",
  "✨ Pattern detected: Look for common letter combinations",
  "🎯 Intuition boost: Trust your first instinct on this one",
  "🧩 Different angle: Try thinking of synonyms or related words"
];

const NATURAL_DISTRACTIONS = [
  "🍕 Hmm, what should you have for lunch today?",
  "📱 You should probably check your messages after this...",
  "🎵 That song is stuck in your head again, isn't it?",
  "☕ When did you last drink water? You're probably dehydrated",
  "🧠 Wait, did you lock the car? Pretty sure you did... but did you?",
  "📚 You really should organize your bookmarks sometime",
  "🏠 The dishes are probably still in the sink from yesterday",
  "💡 Random shower thought: Why don't they make silent velcro?",
  "📧 That email you meant to reply to is still sitting there...",
  "🎯 Focus! But also, wasn't there something else you were supposed to do?",
  "🌙 What time did you go to bed last night? That might explain things",
  "🔋 Your phone battery is probably getting low",
  "🎨 This would be more fun if you could change the colors...",
  "🍎 An apple sounds good right now. Or maybe chips. Definitely chips.",
  "🎪 Remember that weird dream you had? What was that about?",
  "📝 You should write down that idea before you forget it",
  "🏃‍♂️ When was the last time you stretched? Your neck feels stiff",
  "🎬 That movie trailer you saw yesterday looked interesting...",
  "🧹 Your workspace could use some tidying up after this",
  "⭐ What if you could play this game with your own words?"
];

const GAME_CONTEXT_DISTRACTIONS = [
  "🤔 Is FOCUS a word that might appear in this game?",
  "📖 You're really good at this! Maybe try the hard mode next?",
  "🎲 Wonder what the algorithm picks for these words...",
  "🔤 Five letters is perfect. Not too short, not too long",
  "🎯 Your strategy is getting better with each game",
  "💭 This reminds you of that word game you played as a kid",
  "🏆 You should keep track of your win streak",
  "🎨 The colors are satisfying when you get letters right",
  "⚡ Sometimes your brain just knows the answer instantly",
  "🔍 Pattern recognition is definitely your strong suit"
];

export const SymptomManager = ({ adhdSettings, gameState, onDistract }: SymptomManagerProps) => {
  const { toast } = useToast();
  const [lastCreativeHint, setLastCreativeHint] = useState<number>(0);

  // Creative thinking mode - highlight alternative associations
  useEffect(() => {
    if (adhdSettings.isHyperfocus && gameState.currentRow >= 2) {
      const now = Date.now();
      if (now - lastCreativeHint > 15000) { // 15 second cooldown
        const hint = CREATIVE_HINTS[Math.floor(Math.random() * CREATIVE_HINTS.length)];
        toast({
          title: hint,
          description: "Your ADHD brain sees patterns others might miss!",
        });
        setLastCreativeHint(now);
      }
    }
  }, [gameState.currentRow, adhdSettings.isHyperfocus, toast, lastCreativeHint]);

  // Natural distracting thoughts that feel authentic
  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    const thoughtInterval = setInterval(() => {
      const intensity = adhdSettings.intensity / 5; // 0.2 to 1.0
      if (Math.random() < intensity * 0.15) { // 3% to 15% chance based on intensity
        
        // Mix of general distractions and game-context ones
        const allDistractions = [...NATURAL_DISTRACTIONS, ...GAME_CONTEXT_DISTRACTIONS];
        const distraction = allDistractions[Math.floor(Math.random() * allDistractions.length)];
        
        toast({
          title: "💭 Your brain says:",
          description: distraction,
        });
      }
    }, 20000 + Math.random() * 40000); // 20-60 seconds

    return () => clearInterval(thoughtInterval);
  }, [adhdSettings, toast]);

  // Game-aware contextual notifications
  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    // Trigger based on game state
    if (gameState.currentRow === 2 && Math.random() < 0.3) {
      setTimeout(() => {
        toast({
          title: "🎮 Pro tip",
          description: "You're building momentum! This is where the pattern clicks...",
        });
      }, 3000);
    }

    if (gameState.currentRow === 4 && Math.random() < 0.4) {
      setTimeout(() => {
        toast({
          title: "⏰ Time check",
          description: "Two guesses left! No pressure though... well, maybe a little",
        });
      }, 2000);
    }
  }, [gameState.currentRow, adhdSettings, toast]);

  // Distraction triggers
  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    const distractionInterval = setInterval(() => {
      const chance = adhdSettings.intensity / 20; // 5-25% chance based on intensity
      if (Math.random() < chance) {
        onDistract(true);
      }
    }, 15000 + Math.random() * 45000); // 15-60 seconds

    return () => clearInterval(distractionInterval);
  }, [adhdSettings, onDistract]);

  // "Just one more guess" mode
  useEffect(() => {
    if (gameState.isGameOver && !gameState.isWinner && Math.random() < 0.4) {
      setTimeout(() => {
        toast({
          title: "🎯 Wait, just one more try?",
          description: "You were so close! Your brain wants to keep going...",
        });
      }, 2000);
    }
  }, [gameState.isGameOver, gameState.isWinner, toast]);

  // Time estimation comedy
  useEffect(() => {
    if (gameState.currentRow === 1) {
      toast({
        title: "⏰ Time estimate",
        description: "This should take about 2 minutes!",
      });
    }
  }, [gameState.currentRow, toast]);

  // Pattern recognition boosts
  useEffect(() => {
    if (gameState.guesses.length >= 2 && !adhdSettings.isAccommodated) {
      const lastGuess = gameState.guesses[gameState.guesses.length - 1];
      const secondLastGuess = gameState.guesses[gameState.guesses.length - 2];
      
      // Check for patterns in user's guessing style
      let commonLetters = 0;
      for (let i = 0; i < 5; i++) {
        if (lastGuess[i] === secondLastGuess[i]) {
          commonLetters++;
        }
      }
      
      if (commonLetters >= 2 && Math.random() < 0.3) {
        toast({
          title: "🔍 Pattern recognition activated",
          description: "Your ADHD brain is seeing connections! Keep following that thread.",
        });
      }
    }
  }, [gameState.guesses, adhdSettings.isAccommodated, toast]);

  return null; // This component manages effects but doesn't render anything
};
