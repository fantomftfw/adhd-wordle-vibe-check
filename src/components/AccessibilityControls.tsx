
import { Settings } from 'lucide-react';
import type { ADHDSettings } from '@/pages/Game';

interface AccessibilityControlsProps {
  settings: ADHDSettings;
  onSettingsChange: (settings: ADHDSettings) => void;
}

export const AccessibilityControls = ({ settings, onSettingsChange }: AccessibilityControlsProps) => {
  return (
    <div className="w-full">
      <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-1">
        <Settings className="w-4 h-4" />
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
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Mild</span>
        <span>Intense</span>
      </div>
    </div>
  );
};
