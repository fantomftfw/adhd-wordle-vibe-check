import noroLogo from '../assets/noro-logo.png';

interface WaitlistBarProps {
  onJoinClick: () => void;
}

export const WaitlistBar = ({ onJoinClick }: WaitlistBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-sm p-3 border-t border-gray-200 flex items-center justify-between md:hidden animate-in slide-in-from-bottom-12 duration-500">
      <div className="flex items-center gap-3">
        <img src={noroLogo} alt="Noro Logo" className="w-10 h-10" />
        <div>
          <p className="font-bold text-sm text-gray-800">ADHD Wordle made by Noro</p>
          <p className="text-xs text-gray-500">the ADHD productivity app</p>
        </div>
      </div>
      <button 
        onClick={onJoinClick}
        className="bg-gray-100 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors whitespace-nowrap"
      >
        Join waitlist
      </button>
    </div>
  );
};
