import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export type FilterOption = {
  id: string;
  label: string;
  count?: number;
};

export type Filters = {
  categories: string[];
  durations: string[];
  levels: string[];
};

type FilterPanelProps = {
  categories: FilterOption[];
  durations: FilterOption[];
  levels: FilterOption[];
  selectedFilters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClearFilters: () => void;
};

export function FilterPanel({
  categories,
  durations,
  levels,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: FilterPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const toggleCategoryFilter = (categoryId: string) => {
    const updatedCategories = selectedFilters.categories.includes(categoryId)
      ? selectedFilters.categories.filter(id => id !== categoryId)
      : [...selectedFilters.categories, categoryId];
    
    onFilterChange({
      ...selectedFilters,
      categories: updatedCategories,
    });
  };

  const toggleDurationFilter = (durationId: string) => {
    const updatedDurations = selectedFilters.durations.includes(durationId)
      ? selectedFilters.durations.filter(id => id !== durationId)
      : [...selectedFilters.durations, durationId];
    
    onFilterChange({
      ...selectedFilters,
      durations: updatedDurations,
    });
  };

  const toggleLevelFilter = (levelId: string) => {
    const updatedLevels = selectedFilters.levels.includes(levelId)
      ? selectedFilters.levels.filter(id => id !== levelId)
      : [...selectedFilters.levels, levelId];
    
    onFilterChange({
      ...selectedFilters,
      levels: updatedLevels,
    });
  };

  const hasActiveFilters = () => {
    return (
      selectedFilters.categories.length > 0 ||
      selectedFilters.durations.length > 0 ||
      selectedFilters.levels.length > 0
    );
  };

  const renderFilterChips = () => {
    const allSelected = [
      ...categories.filter(cat => selectedFilters.categories.includes(cat.id)),
      ...durations.filter(dur => selectedFilters.durations.includes(dur.id)),
      ...levels.filter(lvl => selectedFilters.levels.includes(lvl.id)),
    ];

    if (allSelected.length === 0) return null;

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}
        contentContainerStyle={styles.chipsContent}
      >
        {allSelected.map(item => (
          <ThemedView key={item.id} style={styles.chip}>
            <ThemedText style={styles.chipText}>{item.label}</ThemedText>
            <TouchableOpacity
              onPress={() => {
                if (categories.find(cat => cat.id === item.id)) {
                  toggleCategoryFilter(item.id);
                } else if (durations.find(dur => dur.id === item.id)) {
                  toggleDurationFilter(item.id);
                } else if (levels.find(lvl => lvl.id === item.id)) {
                  toggleLevelFilter(item.id);
                }
              }}
            >
              <IconSymbol 
                name="xmark.circle.fill" 
                size={16} 
                color={Colors[colorScheme].icon} 
              />
            </TouchableOpacity>
          </ThemedView>
        ))}
        
        <TouchableOpacity onPress={onClearFilters} style={styles.clearChip}>
          <ThemedText style={styles.clearChipText}>Borrar todos</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderFilterSections = () => {
    const expandedSectionElement = (() => {
      if (expandedSection === 'categories') {
        return (
          <ThemedView style={styles.optionsContainer}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.optionItem}
                onPress={() => toggleCategoryFilter(category.id)}
              >
                <ThemedView style={styles.checkboxContainer}>
                  <ThemedView 
                    style={[
                      styles.checkbox,
                      selectedFilters.categories.includes(category.id) && styles.checkboxSelected
                    ]}
                  >
                    {selectedFilters.categories.includes(category.id) && (
                      <IconSymbol 
                        name="checkmark" 
                        size={12} 
                        color="white" 
                      />
                    )}
                  </ThemedView>
                </ThemedView>
                <ThemedText>{category.label}</ThemedText>
                {category.count !== undefined && (
                  <ThemedText style={styles.countText}>({category.count})</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        );
      } else if (expandedSection === 'durations') {
        return (
          <ThemedView style={styles.optionsContainer}>
            {durations.map(duration => (
              <TouchableOpacity
                key={duration.id}
                style={styles.optionItem}
                onPress={() => toggleDurationFilter(duration.id)}
              >
                <ThemedView style={styles.checkboxContainer}>
                  <ThemedView 
                    style={[
                      styles.checkbox,
                      selectedFilters.durations.includes(duration.id) && styles.checkboxSelected
                    ]}
                  >
                    {selectedFilters.durations.includes(duration.id) && (
                      <IconSymbol 
                        name="checkmark" 
                        size={12} 
                        color="white" 
                      />
                    )}
                  </ThemedView>
                </ThemedView>
                <ThemedText>{duration.label}</ThemedText>
                {duration.count !== undefined && (
                  <ThemedText style={styles.countText}>({duration.count})</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        );
      } else if (expandedSection === 'levels') {
        return (
          <ThemedView style={styles.optionsContainer}>
            {levels.map(level => (
              <TouchableOpacity
                key={level.id}
                style={styles.optionItem}
                onPress={() => toggleLevelFilter(level.id)}
              >
                <ThemedView style={styles.checkboxContainer}>
                  <ThemedView 
                    style={[
                      styles.checkbox,
                      selectedFilters.levels.includes(level.id) && styles.checkboxSelected
                    ]}
                  >
                    {selectedFilters.levels.includes(level.id) && (
                      <IconSymbol 
                        name="checkmark" 
                        size={12} 
                        color="white" 
                      />
                    )}
                  </ThemedView>
                </ThemedView>
                <ThemedText>{level.label}</ThemedText>
                {level.count !== undefined && (
                  <ThemedText style={styles.countText}>({level.count})</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        );
      }
      return null;
    })();

    return (
      <ThemedView style={styles.filterSections}>
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('categories')}
        >
          <ThemedText>Categorías</ThemedText>
          <IconSymbol 
            name={expandedSection === 'categories' ? 'chevron.up' : 'chevron.down'} 
            size={16} 
            color={Colors[colorScheme].icon} 
          />
        </TouchableOpacity>
        
        {expandedSection === 'categories' && expandedSectionElement}

        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('durations')}
        >
          <ThemedText>Duración</ThemedText>
          <IconSymbol 
            name={expandedSection === 'durations' ? 'chevron.up' : 'chevron.down'} 
            size={16} 
            color={Colors[colorScheme].icon} 
          />
        </TouchableOpacity>
        
        {expandedSection === 'durations' && expandedSectionElement}

        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('levels')}
        >
          <ThemedText>Nivel</ThemedText>
          <IconSymbol 
            name={expandedSection === 'levels' ? 'chevron.up' : 'chevron.down'} 
            size={16} 
            color={Colors[colorScheme].icon} 
          />
        </TouchableOpacity>
        
        {expandedSection === 'levels' && expandedSectionElement}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="defaultSemiBold">Filtros</ThemedText>
        {hasActiveFilters() && (
          <TouchableOpacity onPress={onClearFilters}>
            <ThemedText style={styles.clearText}>Borrar todos</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {renderFilterChips()}
      {renderFilterSections()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    color: '#0a7ea4',
    fontSize: 14,
  },
  chipsContainer: {
    marginBottom: 12,
  },
  chipsContent: {
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    marginRight: 4,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearChipText: {
    fontSize: 14,
    color: '#0a7ea4',
  },
  filterSections: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  optionsContainer: {
    paddingVertical: 8,
    maxHeight: 150,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  countText: {
    marginLeft: 6,
    opacity: 0.5,
  },
}); 