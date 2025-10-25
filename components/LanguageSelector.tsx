
import React from 'react';
import { AVAILABLE_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguages, onChange }) => {
  const handleToggle = (language: string) => {
    const newSelection = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    onChange(newSelection);
  };

  return (
    <div className="max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
      <div className="grid grid-cols-2 gap-2">
        {AVAILABLE_LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => handleToggle(lang)}
            className={`text-sm w-full text-left p-2 rounded-md transition-colors ${
              selectedLanguages.includes(lang)
                ? 'bg-sky-500 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};
