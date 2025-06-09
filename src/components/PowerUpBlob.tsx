
import { useState, useEffect } from 'react';

interface PowerUpBlobProps {
  x: number;
  y: number;
  type: string;
  onClick: () => void;
}

const POWER_UP_ICONS = {
  slow_time: '⏰',
  reveal_letters: '💡',
  remove_distraction: '🧘',
  focus_mode: '🎯'
};

const POWER_UP_NAMES = {
  slow_time: 'Slow Time',
  reveal_letters: 'Reveal Letters', 
  remove_distraction: 'Remove Distractions',
  focus_mode: 'Focus Mode'
};

export const PowerUpBlob = ({ x, y, type, onClick }: PowerUpBlobProps) => {
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    const fallInterval = setInterval(() => {
      setPosition(prev => ({
        ...prev,
        y: prev.y + 2
      }));
    }, 50);

    return () => clearInterval(fallInterval);
  }, []);

  return (
    <div
      className="fixed z-50 cursor-pointer animate-pulse"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899)',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
      }}
      onClick={onClick}
    >
      <div className="text-center text-white">
        <div className="text-lg">{POWER_UP_ICONS[type as keyof typeof POWER_UP_ICONS]}</div>
        <div className="text-xs font-semibold">
          {POWER_UP_NAMES[type as keyof typeof POWER_UP_NAMES]}
        </div>
      </div>
    </div>
  );
};
