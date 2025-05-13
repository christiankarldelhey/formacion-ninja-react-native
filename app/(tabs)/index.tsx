import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CourseItem, CourseItemProps } from '@/components/CourseItem';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { COURSES_DATA } from '@/constants/CoursesData';

// [FLOW STEP 3] - Main Screen Component
// This is the main screen that displays all courses in a scrollable list
export default function CoursesScreen() {
  const [courses, setCourses] = useState<CourseItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  // [FLOW STEP 4] - Data Loading
  // Simulate API loading with a 1-second delay
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCourses(COURSES_DATA);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCourseSelection = (id: string) => {
    console.log(`Curso seleccionado: ${id}`);
  };

  // [FLOW STEP 5] - Course Rendering
  // Render each course using the CourseItem component
  const renderItem = useCallback(({ item }: { item: CourseItemProps }) => {
    return (
      <CourseItem
        id={item.id}
        title={item.title}
        category={item.category}
        instructor={item.instructor}
        duration={item.duration}
        thumbnail={item.thumbnail}
        viewCount={item.viewCount}
        onPress={() => handleCourseSelection(item.id)}
      />
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Cursos de Oposiciones</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
          <ThemedText style={styles.loadingText}>Cargando cursos...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          onEndReachedThreshold={0.1}
          getItemLayout={(data, index) => ({
            length: 120,
            offset: 120 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
  },
  spinner: {
    marginBottom: 8,
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
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 90 : 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
