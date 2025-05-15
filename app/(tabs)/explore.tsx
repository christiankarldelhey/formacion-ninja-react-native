import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Suggestion } from '@/types';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { COURSES_DATA } from '@/constants/CoursesData';
import { useSearchEngine } from '@/hooks/useSearchEngine';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

export default function ExploreScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const {
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
    searchSuggestions
  } = useSearchEngine(COURSES_DATA);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);


  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Inicializando motor de búsqueda...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Explorar Cursos</ThemedText>
        <ThemedText style={styles.subtitle}>
          Busca entre miles de cursos para oposiciones
        </ThemedText>
      </ThemedView>

      <SearchBar 
        query={query} 
        onChangeQuery={setQuery} 
        onSearch={performSearch}
        suggestions={searchSuggestions as Suggestion[]}
      />
      
      <ThemedView style={styles.filtersToggleContainer}>
        <ThemedText 
          style={styles.filtersToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <IconSymbol 
            name="line.horizontal.3.decrease" 
            size={18} 
            color="#0a7ea4"
            style={styles.filterIcon}
          />
          {" "}{showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.contentContainer}>
        {showFilters && (
          <FilterPanel
            categories={getCategories()}
            durations={getDurations()}
            levels={getLevels()}
            selectedFilters={filters}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
          />
        )}

        <SearchResults 
          results={searchResults}
          isSearching={isSearching}
          searchQuery={query}
          filters={filters}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  filtersToggleContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filtersToggle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});
