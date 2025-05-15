import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Dictionary } from '@/constants/Dictionary';
import React, { useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import type { SearchBarProps } from '@/types';

export function SearchBar({ query, onChangeQuery, onSearch, suggestions }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() ?? 'light';

  const CATEGORY_HEADER_HEIGHT = 36; // Height of the category header
  const SUGGESTION_ITEM_HEIGHT = 48; // Height of each suggestion item

  const updateSuggestionVisibility = (shouldShow: boolean) => {
    if (shouldShow && suggestions.length > 0) {
      setShowSuggestions(true);
      const totalHeight = CATEGORY_HEADER_HEIGHT + (suggestions.length * SUGGESTION_ITEM_HEIGHT);
      Animated.timing(animatedHeight, {
        toValue: Math.min(totalHeight, 220),
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setShowSuggestions(false));
    }
  };

  // Update suggestions visibility when suggestions array changes
  React.useEffect(() => {
    if (isFocused) {
      updateSuggestionVisibility(suggestions.length > 0);
    }
  }, [suggestions, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    updateSuggestionVisibility(suggestions.length > 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    updateSuggestionVisibility(false);
  };

  const handleChangeText = (text: string) => {
    onChangeQuery(text);
    updateSuggestionVisibility(text.length > 0);
  };

  const handleSubmit = () => {
    onSearch();
    inputRef.current?.blur();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChangeQuery(suggestion);
    setShowSuggestions(false);
    onSearch();
  };

  const parseHighlight = (html: string) => {
    const parts = html.split(/(<b>|<\/b>)/);
    let isBold = false;
    return parts.map((part, i) => {
      if (part === '<b>') {
        isBold = true;
        return null;
      }
      if (part === '</b>') {
        isBold = false;
        return null;
      }
      return (
        <Text key={i} style={isBold ? { fontWeight: 'bold' } : undefined}>
          {part}
        </Text>
      );
    }).filter(Boolean);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView 
        style={[
          styles.searchContainer, 
          isFocused && styles.searchContainerFocused
        ]}
      >
        <IconSymbol 
          name="magnifyingglass" 
          size={20} 
          color={Colors[colorScheme].icon} 
        />
        <TextInput
          ref={inputRef}
          style={[
            styles.input, 
            { color: Colors[colorScheme].text }
          ]}
          placeholder={Dictionary.search.placeholder}
          placeholderTextColor={Colors[colorScheme].icon}
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          clearButtonMode="while-editing"
          underlineColorAndroid="transparent"
        />
        {query.length > 0 && (
          <TouchableOpacity 
            onPress={() => onChangeQuery('')}
            style={styles.clearButton}
          >
            <IconSymbol 
              name="xmark.circle.fill" 
              size={20} 
              color={Colors[colorScheme].icon} 
            />
          </TouchableOpacity>
        )}
      </ThemedView>

      {showSuggestions && (
        <Animated.View 
          style={[
            styles.suggestionsContainer,
            { height: animatedHeight }
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => `${item.category}-${item.text}`}
            renderItem={({ item, index }) => {
              // Add category header if it's the first item or if the category changes
              const prevItem = index > 0 ? suggestions[index - 1] : null;
              const showHeader = !prevItem || prevItem.category !== item.category;

              return (
                <>
                  {showHeader && (
                    <ThemedView style={styles.categoryHeader}>
                      <ThemedText style={styles.categoryHeaderText}>
                        {item.category === 'title' ? Dictionary.suggestions.courses : 
                         item.category === 'instructor' ? Dictionary.suggestions.instructors : 
                         Dictionary.suggestions.categories}
                      </ThemedText>
                    </ThemedView>
                  )}
                  <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    if (item.course) {
                      console.log(`Curso seleccionado: ${item.course.id}`);
                    }
                  }}
                >
                  <IconSymbol 
                    name={
                      item.category === 'title' ? 'doc.text' : 
                      item.category === 'instructor' ? 'person' : 
                      'folder'
                    }
                    size={16} 
                    color={Colors[colorScheme].icon} 
                    style={styles.suggestionIcon}
                  />

                  <View style={{ flex: 1 }}>
                    <ThemedText numberOfLines={1}>{item.text}</ThemedText>

                    {item.reason && (
                      <Text numberOfLines={1} style={{ color: Colors[colorScheme].text }}>
                        {item.reason.value !== item.text && (
                          <>
                            <Text>{item.reason.label}: </Text>
                            {parseHighlight(item.reason.highlight)}
                          </>
                        )}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                </>
              );
            }}
          />
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchContainerFocused: {
    borderColor: '#0a7ea4',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  categoryHeader: {
    backgroundColor: '#2a2a2a',
    padding: 8,
    paddingHorizontal: 12,
  },
  categoryHeaderText: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
}); 