
import { Lightbulb } from 'lucide-react';

interface PowerUpBlobProps {
  type: string;
  onClick: () => void;
}

const POWER_UP_NAMES = {
  slow_time: 'Slow Time',
  reveal_letters: 'Reveal Letters', 
  remove_distraction: 'Remove Distractions',
  focus_mode: 'Focus Mode'
};

export const PowerUpBlob = ({ type, onClick }: PowerUpBlobProps) => {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 cursor-pointer animate-pulse"
      style={{
        background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899)',
        borderRadius: '50%',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
      }}
      onClick={onClick}
      title={POWER_UP_NAMES[type as keyof typeof POWER_UP_NAMES]}
    >
      <Lightbulb className="w-8 h-8 text-white" />
    </div>
  );
};
