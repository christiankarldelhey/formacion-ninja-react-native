import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Dictionary } from '@/constants/Dictionary';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import type { FilterOption, Filters, FilterPanelProps } from '@/types';

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

    return (
      <View style={styles.filtersContainer}>
        {allSelected.map(item => (
          <TouchableOpacity key={item.id} style={styles.filterChip}>
            <ThemedText style={styles.filterChipText}>{item.label}</ThemedText>
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
          </TouchableOpacity>
        ))}

      </View>
    );
  };

  const renderFilterSections = () => {
    const renderSection = (section: keyof Filters, options: FilterOption[]) => {
      return (
        <View style={styles.filterSection}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleSection(section)}
          >
            <ThemedText>{section === 'categories' ? Dictionary.filters.categories : section === 'durations' ? Dictionary.filters.duration : Dictionary.filters.level}</ThemedText>
            <IconSymbol 
              name={expandedSection === section ? 'chevron.up' : 'chevron.down'} 
              size={16} 
              color={Colors[colorScheme].icon} 
            />
          </TouchableOpacity>
          
          {expandedSection === section && (
            <View style={styles.optionsContainer}>
              <ScrollView style={styles.scrollContainer}>
                <View style={styles.optionsContent}>
                  {options.map(option => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionItem}
                      onPress={() => {
                        if (section === 'categories') {
                          toggleCategoryFilter(option.id);
                        } else if (section === 'durations') {
                          toggleDurationFilter(option.id);
                        } else if (section === 'levels') {
                          toggleLevelFilter(option.id);
                        }
                      }}
                    >
                      <View style={styles.checkboxContainer}>
                        <View 
                          style={[
                            styles.checkbox,
                            selectedFilters[section].includes(option.id) && styles.checkboxSelected
                          ]}
                        >
                          {selectedFilters[section].includes(option.id) && (
                            <IconSymbol 
                              name="checkmark" 
                              size={12} 
                              color="white" 
                            />
                          )}
                        </View>
                      </View>
                      <ThemedText>{option.label}</ThemedText>
                      {option.count !== undefined && (
                        <ThemedText style={styles.countText}>({option.count})</ThemedText>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      );
    };

    return (
      <View>
        {renderSection('categories', categories)}
        {renderSection('durations', durations)}
        {renderSection('levels', levels)}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {renderFilterChips()}
      <ThemedView style={styles.header}>
        {hasActiveFilters() && (
          <TouchableOpacity onPress={onClearFilters}>
            <ThemedText style={styles.clearText}>{Dictionary.filters.clearAll}</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      
      {renderFilterSections()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    position: 'relative',
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginBottom: 0,
  },
  clearText: {
    paddingVertical: 8,
    color: '#0a7ea4',
    fontSize: 14,
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginTop: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  optionsContent: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  countText: {
    marginLeft: 8,
    opacity: 0.7,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterChipText: {
    marginRight: 4,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  clearChipText: {
    color: '#ff3b30',
  },
}); 