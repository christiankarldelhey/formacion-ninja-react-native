import type { CourseItemProps, FilterOption, Filters, Suggestion } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { levenshteinDistance, matchHighlight, tokenize, normalizeText, stemWord, durationToMinutes, normalizeForId } from '@/utils/searchUtils';

/**
 * SearchIndex implements a full-text search engine with filtering capabilities.
 * It uses an inverted index for efficient text search and maintains separate maps
 * for category, duration, and level-based filtering.
 */
class SearchIndex {
  // Original course documents
  private documents: CourseItemProps[] = [];
  // Maps tokenized words to document IDs for fast lookup
  private invertedIndex: Record<string, Set<string>> = {};
  // Quick access to course details by ID
  private documentMap: Record<string, CourseItemProps> = {};
  // Filter options with counts for UI
  private categoryMap: Record<string, FilterOption> = {};
  private durationMap: Record<string, FilterOption> = {};
  private levelMap: Record<string, FilterOption> = {};
  private cache: Map<string, CourseItemProps[]> = new Map();
  
  /**
   * Initializes the search engine with course documents and builds all necessary indexes
   */
  constructor(documents: CourseItemProps[]) {
    this.documents = documents;
    this.buildIndex();
    this.buildCategoryMap();
    this.buildDurationMap();
    this.buildLevelMap();
  }

  /**
   * Builds the inverted index for full-text search.
   * Tokenizes course title, category, and instructor, then maps each token to course IDs.
   */
  private buildIndex(): void {
    this.documents.forEach(doc => {
      this.documentMap[doc.id] = doc;
      
      const tokens = tokenize(doc.title + ' ' + doc.category + ' ' + doc.instructor);
      
      tokens.forEach(token => {
        if (!this.invertedIndex[token]) {
          this.invertedIndex[token] = new Set<string>();
        }
        this.invertedIndex[token].add(doc.id);
      });
    });
  }

  /**
   * Creates a map of course categories with their counts.
   * Used for the category filter UI and filtering logic.
   */
  private buildCategoryMap(): void {
    const categories = new Map<string, number>();
    
    this.documents.forEach(doc => {
      if (!categories.has(doc.category)) {
        categories.set(doc.category, 0);
      }
      categories.set(doc.category, categories.get(doc.category)! + 1);
    });
    
    categories.forEach((count, category) => {
      const id = normalizeForId(category);
      this.categoryMap[id] = {
        id,
        label: category,
        count,
      };
    });
  }

  /**
   * Categorizes courses into duration ranges (short, medium, long)
   * and maintains counts for each range.
   */
  private buildDurationMap(): void {
    const durationRanges = {
      'short': { id: 'short', label: 'Corta (< 3h)', min: 0, max: 180, count: 0 },
      'medium': { id: 'medium', label: 'Media (3-6h)', min: 180, max: 360, count: 0 },
      'long': { id: 'long', label: 'Larga (> 6h)', min: 360, max: Infinity, count: 0 },
    };
    
    this.documents.forEach(doc => {
      const minutes = durationToMinutes(doc.duration);
      
      if (minutes < 180) {
        durationRanges.short.count++;
      } else if (minutes < 360) {
        durationRanges.medium.count++;
      } else {
        durationRanges.long.count++;
      }
    });
    
    Object.values(durationRanges).forEach(range => {
      this.durationMap[range.id] = {
        id: range.id,
        label: range.label,
        count: range.count,
      };
    });
  }

  /**
   * Analyzes course titles to determine difficulty levels
   * and maintains counts for beginner, intermediate, and advanced courses.
   */
  private buildLevelMap(): void {
    const levels = {
      'beginner': { id: 'beginner', label: 'Principiante', count: 0 },
      'intermediate': { id: 'intermediate', label: 'Intermedio', count: 0 },
      'advanced': { id: 'advanced', label: 'Avanzado', count: 0 },
    };
    
    this.documents.forEach(doc => {
      if (doc.title.toLowerCase().includes('básico') || doc.title.toLowerCase().includes('introducción')) {
        levels.beginner.count++;
      } else if (doc.title.toLowerCase().includes('avanzado') || doc.title.toLowerCase().includes('superior')) {
        levels.advanced.count++;
      } else {
        levels.intermediate.count++;
      }
    });
    
    Object.values(levels).forEach(level => {
      this.levelMap[level.id] = {
        id: level.id,
        label: level.label,
        count: level.count,
      };
    });
  }

  /**
   * Main search function that combines:
   * 1. Full-text search (exact and fuzzy)
   * 2. Filter application (category, duration, level)
   * 3. Result ranking
   */
  search(query: string, filters: Filters): CourseItemProps[] {
    const cacheKey = JSON.stringify({ query, filters });
  
    if (this.cache.has(cacheKey)) {
      console.log('Cache hit for query:', query);
      return this.cache.get(cacheKey)!;
    }

    console.log('Cache miss for query:', query);
  
    if (!query && !this.hasActiveFilters(filters)) {
      this.cache.set(cacheKey, this.documents);
      return this.documents;
    }
  
    let resultIds: Set<string> = new Set();
  
    if (query) {
      const queryTokens = tokenize(query);
      const exactMatches = this.exactSearch(queryTokens);
      exactMatches.forEach(id => resultIds.add(id));
  
      if (resultIds.size < 10) {
        const fuzzyMatches = this.fuzzySearch(queryTokens);
        fuzzyMatches.forEach(id => resultIds.add(id));
      }
    } else {
      this.documents.forEach(doc => resultIds.add(doc.id));
    }
  
    if (this.hasActiveFilters(filters)) {
      resultIds = this.applyFilters(resultIds, filters);
    }
  
    const results = Array.from(resultIds).map(id => this.documentMap[id]);
    const sorted = results.sort((a, b) => a.title.localeCompare(b.title));
  
    this.cache.set(cacheKey, sorted);
    return sorted;
  }
  

  private hasActiveFilters(filters: Filters): boolean {
    return (
      filters.categories.length > 0 ||
      filters.durations.length > 0 ||
      filters.levels.length > 0
    );
  }

  /**
   * Performs exact match search using the inverted index.
   * Returns document IDs that contain ALL query tokens.
   */
  private exactSearch(queryTokens: string[]): string[] {
    const token = queryTokens[0];
    let matchingDocIds = new Set<string>();
    
    if (this.invertedIndex[token]) {
      this.invertedIndex[token].forEach(id => matchingDocIds.add(id));
    }
    
    for (let i = 1; i < queryTokens.length; i++) {
      const token = queryTokens[i];
      
      if (!this.invertedIndex[token]) continue;
      
      matchingDocIds = new Set(
        Array.from(matchingDocIds).filter(id => 
          this.invertedIndex[token].has(id)
        )
      );
    }
    
    return Array.from(matchingDocIds);
  }

  /**
   * Performs fuzzy search for typo tolerance.
   * Uses Levenshtein distance to find similar words.
   */
  private fuzzySearch(queryTokens: string[]): string[] {
    const fuzzyMatches = new Set<string>();
    const allTokens = Object.keys(this.invertedIndex);
    
    queryTokens.forEach(queryToken => {
      const maxDistance = Math.min(2, Math.floor(queryToken.length / 3));
      
      allTokens.forEach(indexToken => {
        const distance = levenshteinDistance(queryToken, indexToken);
        
        if (distance <= maxDistance) {
          this.invertedIndex[indexToken].forEach(id => fuzzyMatches.add(id));
        }
      });
    });
    
    return Array.from(fuzzyMatches);
  }

  /**
   * Applies selected filters to search results:
   * - Category filter: exact match
   * - Duration filter: range-based
   * - Level filter: based on title analysis
   */
  private applyFilters(resultIds: Set<string>, filters: Filters): Set<string> {
    return new Set(
      Array.from(resultIds).filter(id => {
        const doc = this.documentMap[id];
        
        if (filters.categories.length > 0) {
          const categoryId = normalizeForId(doc.category);
          if (!filters.categories.includes(categoryId)) {
            return false;
          }
        }
        
        if (filters.durations.length > 0) {
          const minutes = durationToMinutes(doc.duration);
          const durationMatch = filters.durations.some(durationId => {
            if (durationId === 'short') return minutes < 180;
            if (durationId === 'medium') return minutes >= 180 && minutes < 360;
            if (durationId === 'long') return minutes >= 360;
            return false;
          });
          
          if (!durationMatch) return false;
        }
        
        if (filters.levels.length > 0) {
          let level = 'intermediate';
          
          if (doc.title.toLowerCase().includes('básico') || doc.title.toLowerCase().includes('introducción')) {
            level = 'beginner';
          } else if (doc.title.toLowerCase().includes('avanzado') || doc.title.toLowerCase().includes('superior')) {
            level = 'advanced';
          }
          
          if (!filters.levels.includes(level)) {
            return false;
          }
        }
        
        return true;
      })
    );
  }

  getSuggestions(query: string, limit = 5): Suggestion[] {
    if (!query) return [];
    
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];
    
    const firstToken = queryTokens[0];
    const titleSuggestions = new Set<string>();
    const instructorSuggestions = new Set<string>();
    const categorySuggestions = new Set<string>();
    const suggestions: Suggestion[] = [];
    
    // First pass: collect all unique matches
    this.documents.forEach(doc => {
      // Title suggestions
      const titleTokens = tokenize(doc.title);
      for (const token of titleTokens) {
        if (token.startsWith(firstToken)) {
          titleSuggestions.add(doc.title);
          break;
        }
      }
      
      // Instructor suggestions
      const instructorTokens = tokenize(doc.instructor);
      for (const token of instructorTokens) {
        if (token.startsWith(firstToken)) {
          instructorSuggestions.add(doc.instructor);
          break;
        }
      }

      // Category suggestions
      const categoryTokens = tokenize(doc.category);
      for (const token of categoryTokens) {
        if (token.startsWith(firstToken)) {
          categorySuggestions.add(doc.category);
          break;
        }
      }
    });
    
    // If we don't have enough suggestions, try fuzzy search
    if (titleSuggestions.size < limit || instructorSuggestions.size < limit || categorySuggestions.size < limit) {
      const fuzzyResults = this.fuzzySearch(queryTokens);
      
      for (const id of fuzzyResults) {
        const doc = this.documentMap[id];
        titleSuggestions.add(doc.title);
        instructorSuggestions.add(doc.instructor);
        categorySuggestions.add(doc.category);
      }
    }
    
    // Convert to suggestions with highlights and reasons
    // First titles (with instructor reasons if matching)
    Array.from(titleSuggestions).slice(0, limit).forEach(title => {
      const doc = this.documents.find(d => d.title === title);
      if (!doc) return;
      
      const suggestion: Suggestion = {
        text: title,
        category: 'title',
        course: doc
      };
      
      // Add reason if instructor matches
      if (tokenize(doc.instructor).some(t => t.startsWith(firstToken))) {
        suggestion.reason = {
          label: 'instructor',
          value: doc.instructor,
          highlight: matchHighlight(doc.instructor, query)
        };
      }
      
      suggestions.push(suggestion);
    });
    
    // Then instructors
    Array.from(instructorSuggestions).slice(0, limit).forEach(instructor => {
      suggestions.push({
        text: instructor,
        category: 'instructor',
        reason: {
          label: 'instructor',
          value: instructor,
          highlight: matchHighlight(instructor, query)
        }
      });
    });
    
    // Finally categories
    Array.from(categorySuggestions).slice(0, limit).forEach(category => {
      suggestions.push({
        text: category,
        category: 'category',
        reason: {
          label: 'categoria',
          value: category,
          highlight: matchHighlight(category, query)
        }
      });
    });
    
    return suggestions;
  }
  

  getCategories(): FilterOption[] {
    return Object.values(this.categoryMap);
  }

  getDurations(): FilterOption[] {
    return Object.values(this.durationMap);
  }

  getLevels(): FilterOption[] {
    return Object.values(this.levelMap);
  }
}

/**
 * React hook that provides search functionality with:
 * - Debounced search
 * - Auto-suggestions
 * - Filter management
 * - Loading states
 */
export function useSearchEngine(courses: CourseItemProps[]) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    durations: [],
    levels: [],
  });
  const [searchResults, setSearchResults] = useState<CourseItemProps[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{ text: string; category: 'title' | 'instructor' | 'category' }[]>([]);
  
  const searchIndex = useMemo(() => new SearchIndex(courses), [courses]);
  
  const performSearch = useCallback(() => {
    setIsSearching(true);
    
    setTimeout(() => {
      const results = searchIndex.search(query, filters);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, [searchIndex, query, filters]);
  
  useEffect(() => {
    if (query.length >= 2) {
      const suggestions = searchIndex.getSuggestions(query);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [query, searchIndex]);
  
  useEffect(() => {
    performSearch();
  }, [filters, performSearch]);
  
  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      durations: [],
      levels: [],
    });
  }, []);
  
  const getCategories = useCallback(() => {
    return searchIndex.getCategories();
  }, [searchIndex]);
  
  const getDurations = useCallback(() => {
    return searchIndex.getDurations();
  }, [searchIndex]);
  
  const getLevels = useCallback(() => {
    return searchIndex.getLevels();
  }, [searchIndex]);
  
  return {
    query,
    setQuery,
    filters,
    setFilters,
    searchResults,
    isSearching,
    performSearch,
    getCategories,
    getDurations,
    getLevels,
    clearFilters,
    searchSuggestions,
  };
} 
