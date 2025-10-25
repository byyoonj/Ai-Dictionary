
export type LanguageLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Fluent';

export interface Settings {
  job: string;
  level: LanguageLevel;
  targetLanguages: string[];
  includeExample: boolean;
}

export interface Translation {
  language: string;
  translation: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  definition: string;
  translations: Translation[];
  example?: string;
  audioBase64?: string;
}
