import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InstructionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  showContinueButton?: boolean;
}

export const InstructionsPopup = ({
  isOpen,
  onClose,
  onContinue,
  showContinueButton = true,
}: InstructionsPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How To Play</DialogTitle>
          <DialogDescription className="text-gray-400">
            Guess the Wordle in 6 tries.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Each guess must be a valid 5-letter word.</li>
            <li>The color of the tiles will change to show how close your guess was to the word.</li>
          </ul>
          <hr className="border-gray-600" />
          <h3 className="font-bold text-lg">Examples</h3>
          <div className="space-y-4">
            <div>
              <div className="flex gap-2 mb-1">
                <div className="w-10 h-10 bg-green-500 text-white flex items-center justify-center text-2xl font-bold rounded">W</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">O</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">R</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">D</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">Y</div>
              </div>
              <p><span className="font-bold">W</span> is in the word and in the correct spot.</p>
            </div>
            <div>
              <div className="flex gap-2 mb-1">
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">L</div>
                <div className="w-10 h-10 bg-yellow-500 text-white flex items-center justify-center text-2xl font-bold rounded">I</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">G</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">H</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">T</div>
              </div>
              <p><span className="font-bold">I</span> is in the word but in the wrong spot.</p>
            </div>
            <div>
              <div className="flex gap-2 mb-1">
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">R</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">O</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">G</div>
                <div className="w-10 h-10 bg-gray-600 text-white flex items-center justify-center text-2xl font-bold rounded">U</div>
                <div className="w-10 h-10 border-2 border-gray-500 text-white flex items-center justify-center text-2xl font-bold rounded">E</div>
              </div>
              <p><span className="font-bold">U</span> is not in the word in any spot.</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          {showContinueButton && (
            <Button onClick={onContinue} className="w-full bg-green-600 hover:bg-green-700">
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
