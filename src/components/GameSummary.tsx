import { Share2, Home, RefreshCw } from 'lucide-react';
import type { GameState } from '@/pages/Game';

interface GameSummaryProps {
  gameState: GameState;
  timeElapsed: number;
  correctWord: string;
  onCopyToClipboard: () => void;
  onShareOnX: () => void;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameSummary = ({
  gameState,
  timeElapsed,
  correctWord,
  onCopyToClipboard,
  onShareOnX,
  onPlayAgain,
  onGoHome,
}: GameSummaryProps) => {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-card-foreground mb-3">✨ Well Played! ✨</h1>
        <p className="text-xl text-muted-foreground">
          The word was: <span className="font-bold text-primary">{correctWord}</span>
        </p>
      </div>

      {/* Stats & Actions */}
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 mb-12">
        <div className="grid grid-cols-2 gap-4 text-center mb-6">
          <div>
            <div className="text-3xl font-bold text-primary">{gameState.guesses.length} / 6</div>
            <div className="text-sm text-muted-foreground">Attempts</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">Time Taken</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCopyToClipboard}
            className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <Share2 className="w-5 h-5" />
            Share Results
          </button>
          <button
            onClick={onShareOnX}
            className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75ZM11.46 13.812h1.57L4.34 2.188H2.76l8.7 11.624Z"/>
            </svg>
            Share on X
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={onGoHome}
            className="w-full bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/60 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={onPlayAgain}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>

      {/* Symptom Table */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-12">
        <h3 className="text-2xl font-semibold text-card-foreground mb-6 text-center">🧠 How In-Game Events Mirror ADHD</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 font-semibold text-primary">In-Game Event</th>
                <th className="p-4 font-semibold text-primary">ADHD Symptom</th>
                <th className="p-4 font-semibold text-primary">What It Feels Like</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="p-4 font-medium">Keyboard Freezing</td>
                <td className="p-4">Executive Dysfunction</td>
                <td className="p-4 text-muted-foreground">The struggle to start a task, even when you know what to do.</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 font-medium">Colors Shifting / Screen Shaking</td>
                <td className="p-4">Sensory Overload</td>
                <td className="p-4 text-muted-foreground">Feeling overwhelmed by sights and sounds, making it hard to process info.</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 font-medium">Distracting Pop-ups & Blobs</td>
                <td className="p-4">Inattentiveness</td>
                <td className="p-4 text-muted-foreground">Losing focus due to external stimuli and having to regain your train of thought.</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 font-medium">Forced Mini-Games</td>
                <td className="p-4">Task-Switching Difficulty</td>
                <td className="p-4 text-muted-foreground">The mental jolt of being pulled from one task to another unexpectedly.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Hyperfocus Mode</td>
                <td className="p-4">Hyperfocus</td>
                <td className="p-4 text-muted-foreground">An intense state of concentration where the rest of the world fades away.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Power-Ups */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-12">
        <h3 className="text-2xl font-semibold text-card-foreground mb-6 text-center">💡 Power-Ups as Real-Life Strategies</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
            <h4 className="font-semibold text-primary mb-1">🧘 Remove Distractions</h4>
            <p className="text-sm text-muted-foreground">Corresponds to creating a quiet, focused environment or using noise-canceling headphones.</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
            <h4 className="font-semibold text-primary mb-1">⏰ Slow Time</h4>
            <p className="text-sm text-muted-foreground">Relates to breaking down large tasks into smaller, manageable steps to avoid feeling overwhelmed.</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
            <h4 className="font-semibold text-primary mb-1">🔍 Reveal Letters</h4>
            <p className="text-sm text-muted-foreground">Is like asking for help, seeking clarification, or getting a hint when you're stuck.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-8 md:p-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Ready for the Next Step?</h3>
            <p className="text-muted-foreground mb-6">
              This game offers a glimpse into ADHD, but managing it is a real-life challenge. Noro is our upcoming app designed to provide the tools and support needed to navigate ADHD with confidence.
            </p>
            <button
              onClick={() => window.open('https://noro.so', '_blank')}
              className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-transform transform hover:scale-105"
            >
              Join the Waitlist
            </button>
          </div>
          <div className="hidden md:block">
            <img src="/noro-ss.png" alt="Noro App Screenshot" className="object-cover w-full h-full bg-muted"/>
          </div>
        </div>
      </div>
    </div>
  );
};
