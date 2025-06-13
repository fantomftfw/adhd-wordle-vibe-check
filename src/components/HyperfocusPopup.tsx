import React, { useState, useEffect } from 'react';

const FUN_FACTS = [
  "A group of flamingos is called a 'flamboyance'.",
  "The national animal of Scotland is the unicorn.",
  "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
  "A single cloud can weigh more than a million pounds.",
  "There are more trees on Earth than stars in the Milky Way galaxy.",
  "Octopuses have three hearts.",
  "Bananas are berries, but strawberries aren't."
];

interface HyperfocusPopupProps {
  onClose: () => void;
}

export const HyperfocusPopup = ({ onClose }: HyperfocusPopupProps) => {
  const [fact] = useState(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonDisabled(false);
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground rounded-lg p-8 m-4 max-w-md w-full shadow-2xl animate-in fade-in-0 zoom-in-95">
        <h2 className="text-2xl font-bold text-primary mb-4">Wait, a Fun Fact!</h2>
        <p className="text-lg mb-6">{fact}</p>
        <button
          onClick={onClose}
          disabled={isButtonDisabled}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed hover:bg-primary/90"
        >
          {isButtonDisabled ? 'Absorbing fact...' : 'Return to Game'}
        </button>
      </div>
    </div>
  );
};
