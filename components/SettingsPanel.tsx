
import React from 'react';
import type { Settings } from '../types';
import { LANGUAGE_LEVELS } from '../constants';
import { LanguageSelector } from './LanguageSelector';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ ...settings, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onSettingsChange({ ...settings, [name]: checked });
  };
  
  const handleLanguagesChange = (languages: string[]) => {
    onSettingsChange({ ...settings, targetLanguages: languages });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-xl font-bold text-slate-700 border-b pb-3">Personalize</h2>
      
      <div>
        <label htmlFor="job" className="block text-sm font-medium text-slate-600 mb-1">Your Profession</label>
        <input
          type="text"
          id="job"
          name="job"
          value={settings.job}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g., Doctor, Artist, Developer"
        />
      </div>

      <div>
        <label htmlFor="level" className="block text-sm font-medium text-slate-600 mb-1">Language Level</label>
        <select
          id="level"
          name="level"
          value={settings.level}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white"
        >
          {LANGUAGE_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-2">Translation Languages</h3>
        <LanguageSelector selectedLanguages={settings.targetLanguages} onChange={handleLanguagesChange} />
      </div>

      <div className="flex items-center pt-4 border-t">
        <input
          type="checkbox"
          id="includeExample"
          name="includeExample"
          checked={settings.includeExample}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
        <label htmlFor="includeExample" className="ml-3 block text-sm text-slate-700">
          Include profession-specific example
        </label>
      </div>
    </div>
  );
};
