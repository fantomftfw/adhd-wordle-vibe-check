
import { useState, useEffect } from 'react';

interface ContextSwitchPopupProps {
  onComplete: () => void;
}

const PUZZLES = [
  {
    question: "What's 7 + 5?",
    answer: "12",
    options: ["11", "12", "13", "14"]
  },
  {
    question: "Which is bigger?",
    answer: "Elephant",
    options: ["Mouse", "Elephant", "Cat", "Dog"]
  },
  {
    question: "2 × 4 = ?",
    answer: "8",
    options: ["6", "7", "8", "9"]
  },
  {
    question: "Pick the color:",
    answer: "Blue",
    options: ["Red", "Blue", "Green", "Yellow"]
  }
];

export const ContextSwitchPopup = ({ onComplete }: ContextSwitchPopupProps) => {
  const [puzzle] = useState(() => PUZZLES[Math.floor(Math.random() * PUZZLES.length)]);
  const [timeLeft, setTimeLeft] = useState(7);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleAnswer = (answer: string) => {
    if (answer === puzzle.answer) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">🧠 Quick Task!</h3>
          <p className="text-sm text-gray-600">Context switching activated</p>
          <div className="text-xs text-red-600 mt-1">Time: {timeLeft}s</div>
        </div>
        
        <div className="mb-4">
          <p className="text-center font-medium text-gray-800 mb-3">
            {puzzle.question}
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {puzzle.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-3 rounded transition-colors text-sm font-medium"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          Solve to return to the game
        </p>
      </div>
    </div>
  );
};
