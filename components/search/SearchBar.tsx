import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

type SearchBarProps = {
  query: string;
  onChangeQuery: (text: string) => void;
  onSearch: () => void;
  suggestions: string[];
};

export function SearchBar({ query, onChangeQuery, onSearch, suggestions }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() ?? 'light';

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
      Animated.timing(animatedHeight, {
        toValue: Math.min(suggestions.length * 44, 220),
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setShowSuggestions(false));
  };

  const handleChangeText = (text: string) => {
    onChangeQuery(text);
    if (text.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
      Animated.timing(animatedHeight, {
        toValue: Math.min(suggestions.length * 44, 220),
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

  const handleSubmit = () => {
    onSearch();
    inputRef.current?.blur();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChangeQuery(suggestion);
    setShowSuggestions(false);
    onSearch();
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
          placeholder="Buscar cursos..."
          placeholderTextColor={Colors[colorScheme].icon}
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          clearButtonMode="while-editing"
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
            data={suggestions.slice(0, 5)}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <IconSymbol 
                  name="clock" 
                  size={16} 
                  color={Colors[colorScheme].icon} 
                  style={styles.suggestionIcon}
                />
                <ThemedText numberOfLines={1}>{item}</ThemedText>
              </TouchableOpacity>
            )}
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
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    elevation: 2,
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
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  suggestionIcon: {
    marginRight: 12,
  },
}); 