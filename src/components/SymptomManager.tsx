
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

const RANDOM_THOUGHTS = [
  "Remember to drink water!",
  "Your posture could probably use some adjusting",
  "When was the last time you took a break?",
  "That thing you forgot... it'll come back to you",
  "The deadline for that project is... wait, what project?"
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

  // Random thought intrusions
  useEffect(() => {
    if (adhdSettings.isAccommodated || adhdSettings.isHyperfocus) return;

    const thoughtInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        const thought = RANDOM_THOUGHTS[Math.floor(Math.random() * RANDOM_THOUGHTS.length)];
        toast({
          title: "💭 Random thought",
          description: thought,
        });
      }
    }, 30000 + Math.random() * 60000); // 30-90 seconds

    return () => clearInterval(thoughtInterval);
  }, [adhdSettings, toast]);

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
