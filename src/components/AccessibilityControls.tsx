
import { useState } from 'react';
import { Settings, Brain, Focus, Shield } from 'lucide-react';
import type { ADHDSettings } from '@/pages/Game';

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
        className="flex items-center gap-2 rounded-md border bg-secondary text-secondary-foreground px-4 py-2 text-sm hover:bg-secondary/80 transition-colors"
      >
        <Settings className="w-4 h-4" />
        ADHD Symptom Intensity
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
              min="0"
              max="5"
              value={settings.intensity}
              onChange={(e) => onSettingsChange({ ...settings, intensity: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Mild</span>
              <span>Intense</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
