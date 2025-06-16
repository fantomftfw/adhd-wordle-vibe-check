import { useState, useEffect } from 'react';

interface ContextSwitchPopupProps {
  onComplete: () => void;
}

const FACTS = [
  'A group of flamingos is called a "flamboyance."',
  'The national animal of Scotland is the unicorn.',
  'Honey never spoils.',
  "A shrimp's heart is in its head.",
  "It's impossible for most people to lick their own elbow.",
  'A crocodile cannot stick its tongue out.',
];

export const ContextSwitchPopup = ({ onComplete }: ContextSwitchPopupProps) => {
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [buttonCountdown, setButtonCountdown] = useState(3);

  useEffect(() => {
    // This timer enables the button after 3 seconds.
    const activationTimer = setTimeout(() => {
      setIsButtonActive(true);
    }, 3000);

    // This interval updates the countdown text on the button.
    const countdownInterval = setInterval(() => {
      setButtonCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(activationTimer);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🧠 Random Fact!</h3>
        <p className="text-base text-gray-700 mb-4">{fact}</p>
        <button
          onClick={onComplete}
          disabled={!isButtonActive}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isButtonActive ? 'Continue Game' : `Closing in ${buttonCountdown}...`}
        </button>
      </div>
    </div>
  );
};
