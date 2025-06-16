import noroLogo from '../assets/noro-logo.png';

interface WaitlistBarProps {
  onJoinClick: () => void;
}

export const WaitlistBar = ({ onJoinClick }: WaitlistBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-t border-gray-200 bg-white/90 p-3 backdrop-blur-sm duration-500 animate-in slide-in-from-bottom-12 md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg md:border">
      <div className="flex items-center gap-3">
        <img src={noroLogo} alt="Noro Logo" className="h-10 w-10" />
        <div>
          <p className="font-bold text-sm text-gray-800">ADHD brain? not broken. just different. want help?</p>
        </div>
      </div>
      <button
        onClick={onJoinClick}
        className="bg-gray-100 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors whitespace-nowrap"
      >
        Okay but how?
      </button>
    </div>
  );
};
