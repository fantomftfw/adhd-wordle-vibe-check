import React, { useState } from 'react';

interface ExitIntentPopupProps {
  onClose: () => void;
  onSubmit: (data: { name: string; email: string }) => void;
}

export const ExitIntentPopup = ({ onClose, onSubmit }: ExitIntentPopupProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onSubmit({ name, email });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-in fade-in-0">
      <div className="bg-card text-card-foreground rounded-lg p-8 m-4 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-primary mb-3">Wait, Don't Go!</h2>
        <p className="text-muted-foreground mb-6">
          Enjoying the challenge? Get updates and new features straight to your inbox.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-input text-foreground px-4 py-2 rounded-md border border-border mb-4"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full bg-input text-foreground px-4 py-2 rounded-md border border-border mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Keep Me Updated!
          </button>
        </form>
      </div>
    </div>
  );
};
