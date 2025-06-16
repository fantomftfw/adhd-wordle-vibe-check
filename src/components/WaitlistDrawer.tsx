import React, { useState, useEffect, useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface WaitlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string }) => void;
}

export const WaitlistDrawer = ({ isOpen, onClose, onSubmit }: WaitlistDrawerProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen, onClose);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubmit({ email });
    }
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" aria-modal="true" role="dialog">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 animate-in fade-in-0" onClick={onClose}></div>

      {/* Dialog Content */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="relative mx-4 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in slide-in-from-bottom-24 duration-300 md:slide-in-from-bottom-0 md:zoom-in-95"
      >
        {/* Handle (Mobile only) */}
        <div className="mx-auto mb-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300 md:hidden"></div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Join the Noro Waitlist</h2>
          <p className="text-gray-600 mb-6">
            Tired of productivity tools that don't work for your brain? So were we.
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
            Let me in before y'all forget
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            <strong>3,756+ ADHD'ers</strong> are already in line.
          </p>
        </div>
      </div>
    </div>
  );
};
