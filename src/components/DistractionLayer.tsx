
import { useState, useEffect } from 'react';
import { X, Bell, Clock, Heart } from 'lucide-react';

interface DistractionLayerProps {
  isActive: boolean;
  intensity: number;
  onClose: () => void;
}

const DISTRACTIONS = [
  {
    type: 'notification',
    title: 'Did you remember to call your mom?',
    content: 'She called yesterday and you meant to call back...',
    icon: Bell
  },
  {
    type: 'reminder',
    title: 'Random thought',
    content: 'Why do they call it "rush hour" when nobody is moving?',
    icon: Clock
  },
  {
    type: 'task',
    title: 'Quick question',
    content: 'What was that song you heard this morning? The one that goes "da da da"?',
    icon: Heart
  },
  {
    type: 'worry',
    title: 'Wait, did you...',
    content: 'Lock the door when you left? You should probably check.',
    icon: Bell
  },
  {
    type: 'hyperfixation',
    title: 'Interesting fact!',
    content: 'Did you know octopuses have three hearts? You should research marine biology...',
    icon: Heart
  }
];

export const DistractionLayer = ({ isActive, intensity, onClose }: DistractionLayerProps) => {
  const [currentDistraction, setCurrentDistraction] = useState(DISTRACTIONS[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [backgroundElements, setBackgroundElements] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (isActive) {
      setCurrentDistraction(DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)]);
      setIsVisible(true);
      
      // Generate random background elements
      const elements = Array.from({ length: intensity * 2 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: `hsl(${Math.random() * 360}, 70%, 80%)`
      }));
      setBackgroundElements(elements);
    } else {
      setIsVisible(false);
      setBackgroundElements([]);
    }
  }, [isActive, intensity]);

  if (!isVisible) return null;

  const IconComponent = currentDistraction.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      {/* Animated background elements */}
      {backgroundElements.map((element) => (
        <div
          key={element.id}
          className="absolute w-4 h-4 rounded-full animate-pulse"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            backgroundColor: element.color,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
      
      {/* Main distraction popup */}
      <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 animate-scale-in shadow-lg">
        <div className="flex items-start gap-3">
          <IconComponent className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground mb-2">
              {currentDistraction.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {currentDistraction.content}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm hover:bg-primary/90 transition-colors"
              >
                Focus
              </button>
              <button
                onClick={() => {
                  // Simulate falling down a rabbit hole
                  setTimeout(() => {
                    setCurrentDistraction(DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)]);
                  }, 500);
                }}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm hover:bg-secondary/80 transition-colors"
              >
                Tell me more...
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Side panels with "interesting" information */}
      {intensity >= 4 && (
        <div className="absolute right-4 top-4 bg-card border border-border rounded-lg p-4 max-w-xs animate-slide-in-right">
          <h4 className="font-medium text-card-foreground mb-2">Did you know?</h4>
          <p className="text-sm text-muted-foreground">
            Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!
          </p>
        </div>
      )}
    </div>
  );
};
