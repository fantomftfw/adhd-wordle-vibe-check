import React, { useState } from 'react';
import noroLogo from '../assets/noro-logo.png';

interface ExitIntentPopupProps {
  onClose: () => void;
  onSubmit: (data: { email: string }) => void;
}

export const ExitIntentPopup = ({ onClose, onSubmit }: ExitIntentPopupProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubmit({ email });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in-0 font-sans">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex overflow-hidden m-4">
        {/* Left Column - Image */}
        <div className="w-1/2 hidden md:block">
          <img src={noroLogo} alt="A calm, smiling purple blob character representing Noro AI" className="w-full h-full object-cover" />
        </div>

        {/* Right Column - Content */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              This game ends. <br /> ADHD chaos does not 😵‍💫
            </h2>
            <p className="text-gray-600 mb-4">
              You’re not the only one tired of productivity tools that don’t work for your brain.
            </p>
            <p className="text-gray-600 mb-6 font-semibold">
              Meet Noro: AI that helps you start <em>and</em> get sh*t done — not just plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition"
              required
            />
            <button
              type="submit"
              className="w-full bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-all duration-300 font-semibold text-lg"
            >
              Let me in before y’all forget
            </button>
          </form>

          <div className="text-center mt-4">
             <p className="text-sm text-gray-500"><strong>3,756+ ADHD’ers</strong> in 14+ countries are already in line.</p>
             <p className="text-xs text-gray-400 mt-2">Early access closes Friday (unless we forget, haha)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
