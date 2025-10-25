
import React, { useState } from 'react';
import type { DictionaryEntry } from '../types';
import { Spinner } from './Spinner';
import { ErrorAlert } from './ErrorAlert';

// Audio decoding utilities as per @google/genai documentation for raw PCM data.
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000; // Gemini TTS returns audio at 24000 Hz
  const numChannels = 1;     // and in mono

  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface ResultsDisplayProps {
  isLoading: boolean;
  error: string | null;
  data: DictionaryEntry | null;
}

const WelcomeMessage: React.FC = () => (
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-sky-100 to-indigo-200 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome to AI Dictionary</h2>
        <p className="mt-2 text-slate-500">
            Personalize your settings on the left and enter a word above to get started.
        </p>
    </div>
);


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, error, data }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isLoading) {
    return <Spinner />;
  }
  if (error) {
    return <ErrorAlert message={error} />;
  }
  if (!data) {
    return <WelcomeMessage />;
  }

  const handlePlayAudio = async () => {
    if (!data?.audioBase64 || isPlaying) return;

    setIsPlaying(true);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBytes = decode(data.audioBase64);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContext);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

      source.onended = () => {
        setIsPlaying(false);
        audioContext.close();
      };
    } catch (e) {
      console.error("Failed to play audio:", e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg animate-fade-in space-y-6">
      <div className="border-b pb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-slate-800">{data.word}</h2>
          {data.phonetic && <p className="text-lg text-slate-500 mt-1">{data.phonetic}</p>}
        </div>
        {data.audioBase64 && (
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="flex-shrink-0 p-3 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-wait"
            aria-label="Play pronunciation"
          >
            {isPlaying ? (
                <svg className="h-6 w-6 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            )}
          </button>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-semibold uppercase text-sky-600 tracking-wider mb-2">Definition</h3>
        <p className="text-slate-700 leading-relaxed">{data.definition}</p>
      </div>

      {data.translations && data.translations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase text-sky-600 tracking-wider mb-3">Translations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {data.translations.map(t => (
              <div key={t.language} className="bg-slate-50 p-3 rounded-lg">
                <p className="font-semibold text-slate-700">{t.language}</p>
                <p className="text-slate-600">{t.translation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.example && (
         <div className="pt-6 border-t">
            <h3 className="text-sm font-semibold uppercase text-sky-600 tracking-wider mb-2">Example</h3>
            <blockquote className="border-l-4 border-sky-200 pl-4">
                <p className="text-slate-700 italic">"{data.example}"</p>
            </blockquote>
        </div>
      )}
    </div>
  );
};
