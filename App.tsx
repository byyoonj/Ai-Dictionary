
import React, { useState, useCallback } from 'react';
import { SettingsPanel } from './components/SettingsPanel';
import { SearchForm } from './components/SearchForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import type { DictionaryEntry, LanguageLevel, Settings } from './types';
import { getDictionaryEntry, getWordPronunciation } from './services/geminiService';

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    job: 'Software Engineer',
    level: 'Intermediate' as LanguageLevel,
    targetLanguages: ['Spanish', 'German'],
    includeExample: true,
  });
  const [definition, setDefinition] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDefine = useCallback(async (word: string) => {
    if (!word) {
      setError('Please enter a word to define.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDefinition(null);
    try {
      const [entryResult, audioResult] = await Promise.all([
        getDictionaryEntry(word, settings),
        getWordPronunciation(word),
      ]);
      setDefinition({ ...entryResult, audioBase64: audioResult });
    } catch (err) {
      console.error(err);
      setError('Failed to get definition. Please check your connection or API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <SearchForm onDefine={handleDefine} isLoading={isLoading} />
            </div>
            <div className="mt-8">
              <ResultsDisplay
                isLoading={isLoading}
                error={error}
                data={definition}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
