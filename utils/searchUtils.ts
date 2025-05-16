import { CourseItemProps, FilterOption } from '@/types';

export enum SearchCategory {
  TITLE = 'title',
  INSTRUCTOR = 'instructor',
  CATEGORY = 'category',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum SearchReason {
  INSTRUCTOR = 'instructor',
  CATEGORY = 'categoria',
}

export const SPANISH_SUFFIXES = [
  'ciones', 'cion', 'mente', 'idades', 'idad',
  'icamente', 'ista', 'istas', 'izar', 'izado', 'izacion',
  'ante', 'antes', 'able', 'ibles',
  'ador', 'adores', 'adora', 'adoras',
  'ando', 'iendo', 'ado', 'ido', 'aba', 'ia', 'ar', 'er', 'ir'
] as const;



/**
 * Normalizes text by removing accents, special characters, and converting to lowercase
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/ü/g, 'u')
    .toLowerCase();
}

/**
 * Converts duration string (HH:MM) to total minutes
 */
export function durationToMinutes(duration: string): number {
  const parts = duration.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/**
 * Normalizes text for use as an ID by removing non-word characters
 */
export function normalizeForId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w]/g, '_');
}

/**
 * Tokenizes text for search indexing:
 * 1. Normalizes text
 * 2. Removes punctuation
 * 3. Splits into words
 * 4. Filters short words
 * 5. Applies word stemming
 */
export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length >= 2)
    .map(token => stemWord(token));
}

 /**
   * Basic Spanish word stemming.
   * Removes common suffixes to match similar words
   * (e.g., 'programación' and 'programador' -> 'program')
   */
 export function stemWord(word: string): string {


  for (const suffix of SPANISH_SUFFIXES) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      word = word.slice(0, -suffix.length);
      break;
    }
  }

  if (word.endsWith('es') && word.length > 4) {
    word = word.slice(0, -2);
  } else if (word.endsWith('s') && word.length > 3) {
    word = word.slice(0, -1);
  }

  return word;
}

  /**
   * Calculates the edit distance between two strings.
   * Used for fuzzy search to find similar words even with typos.
   */
  export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    return matrix[a.length][b.length];
  }

/**
 * Highlights matching text in search results
 */
export function matchHighlight(text: string, query: string): string {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'i');
  return text.replace(regex, '<b>$1</b>');
}




