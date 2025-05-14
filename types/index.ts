// Course Types
export interface CourseItemProps {
  id: string;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  viewCount: number;
  onPress?: () => void;
}

// Search Types
export interface Filters {
  categories: string[];
  durations: string[];
  levels: string[];
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export interface Suggestion {
  text: string;
  category: 'title' | 'instructor' | 'category';
  course?: CourseItemProps; 
  reason?: {
    label: string; 
    value: string; 
    highlight: string; 
  };
}

// Search Bar Props
export interface SearchBarProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onSearch: () => void;
  suggestions: Suggestion[];
}

// Filter Panel Props
export interface FilterPanelProps {
  categories: FilterOption[];
  durations: FilterOption[];
  levels: FilterOption[];
  selectedFilters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

// Search Results Props
export interface SearchResultsProps {
  results: CourseItemProps[];
  isSearching: boolean;
  searchQuery: string;
  filters: Filters;
}