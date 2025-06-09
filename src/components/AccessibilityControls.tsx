
import { useState } from 'react';
import { Settings, Brain, Focus, Shield } from 'lucide-react';
import type { ADHDSettings } from '@/pages/Index';

interface AccessibilityControlsProps {
  settings: ADHDSettings;
  onSettingsChange: (settings: ADHDSettings) => void;
}

export const AccessibilityControls = ({ settings, onSettingsChange }: AccessibilityControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (key: keyof ADHDSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <Settings className="w-4 h-4" />
        Accessibility Settings
      </button>
      
      {isOpen && (
        <div className="absolute top-8 left-0 right-0 bg-card border border-border rounded-lg p-4 space-y-4 z-10 animate-fade-in">
          {/* Intensity Slider */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              ADHD Symptom Intensity: {settings.intensity}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.intensity}
              onChange={(e) => updateSetting('intensity', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Mild</span>
              <span>Intense</span>
            </div>
          </div>
          
          {/* Quick Toggle Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updateSetting('isAccommodated', !settings.isAccommodated)}
              className={`flex flex-col items-center gap-1 p-3 rounded text-xs transition-colors ${
                settings.isAccommodated 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Shield className="w-4 h-4" />
              Accommodate
            </button>
            
            <button
              onClick={() => updateSetting('isGoodBrainDay', !settings.isGoodBrainDay)}
              className={`flex flex-col items-center gap-1 p-3 rounded text-xs transition-colors ${
                settings.isGoodBrainDay 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Brain className="w-4 h-4" />
              Good Brain Day
            </button>
            
            <button
              onClick={() => updateSetting('isHyperfocus', !settings.isHyperfocus)}
              className={`flex flex-col items-center gap-1 p-3 rounded text-xs transition-colors ${
                settings.isHyperfocus 
                  ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Focus className="w-4 h-4" />
              Force Hyperfocus
            </button>
          </div>
          
          {/* Explanations */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Accommodate:</strong> Reduces all ADHD symptoms temporarily</p>
            <p><strong>Good Brain Day:</strong> Lower symptom intensity, better performance</p>
            <p><strong>Hyperfocus:</strong> Removes distractions but time moves faster</p>
          </div>
        </div>
      )}
    </div>
  );
};
