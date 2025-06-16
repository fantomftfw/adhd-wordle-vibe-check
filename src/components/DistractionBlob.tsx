import React, { useMemo } from 'react';
import { Gift, Zap, Star, AlertTriangle, MessageSquare, CheckCircle, HelpCircle, Award, Target, Bomb } from 'lucide-react';

interface DistractionBlobProps {
  onClick: () => void;
  style: React.CSSProperties;
}

const DISTRACTIONS = [
  { text: 'Free Hint!', icon: <Gift size={24} />, color: 'from-green-400 to-blue-500' },
  { text: 'Power Up!', icon: <Zap size={24} />, color: 'from-yellow-400 to-orange-500' },
  { text: 'Bonus Points!', icon: <Star size={24} />, color: 'from-pink-500 to-purple-600' },
  { text: 'Urgent Alert!', icon: <AlertTriangle size={24} />, color: 'from-red-500 to-red-700' },
  { text: 'New Message', icon: <MessageSquare size={24} />, color: 'from-blue-400 to-indigo-500' },
  { text: 'Solve Instantly', icon: <CheckCircle size={24} />, color: 'from-teal-400 to-cyan-600' },
  { text: 'Secret Level?', icon: <HelpCircle size={24} />, color: 'from-gray-700 to-gray-900' },
  { text: 'Achievement', icon: <Award size={24} />, color: 'from-yellow-500 to-amber-600' },
  { text: 'Click Me!', icon: <Target size={24} />, color: 'from-indigo-500 to-violet-700' },
  { text: 'DO NOT CLICK', icon: <Bomb size={24} />, color: 'from-rose-700 to-pink-900' },
];

export const DistractionBlob = ({ onClick, style }: DistractionBlobProps) => {
  const distraction = useMemo(() => DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)], []);

  return (
    <div
      className={`fixed w-32 h-32 rounded-full cursor-pointer z-40 flex flex-col items-center justify-center p-2 text-white font-bold text-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse-slow bg-gradient-to-br ${distraction.color}`}
      style={style}
      onClick={onClick}
    >
      {distraction.icon}
      <span className="mt-1 text-sm">{distraction.text}</span>
    </div>
  );
};
