import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import type { CourseItemProps } from '@/types';

// [FLOW STEP 6] - Course Item Interface
// Define the shape of data required for each course item
// export type CourseItemProps = {
//   id: string;
//   title: string;
//   category: string;
//   instructor: string;
//   duration: string;
//   thumbnail: string;
//   viewCount: number;
//   onPress?: () => void;
// };

// [FLOW STEP 7] - Course Item Component
// Reusable component that displays a single course with consistent styling
export function CourseItem({
  title,
  category,
  instructor,
  duration,
  thumbnail,
  viewCount,
  onPress,
}: CourseItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Image Row */}
      <ThemedView style={styles.imageRow}>
        <ThemedView style={styles.thumbnailContainer}>
          {Platform.OS === 'web' ? (
            <Image 
              source={{ uri: thumbnail }} 
              style={[styles.thumbnail, { objectFit: 'cover' }]} 
              // Using backgroundColor as placeholder
            />
          ) : (
            <ExpoImage 
              source={{ uri: thumbnail }} 
              style={styles.thumbnail} 
              contentFit="cover"
              // Using backgroundColor as placeholder
              transition={200}
              cachePolicy="memory-disk"
            />
          )}
          <ThemedView style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>{duration}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Info Row */}
      <ThemedView style={styles.infoRow}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedView style={styles.metaInfo}>
          <ThemedText style={styles.instructor}>{instructor}</ThemedText>
          <ThemedView style={styles.statsRow}>
            <ThemedText style={styles.viewCount}>{viewCount} visualizaciones</ThemedText>
            <ThemedText style={styles.bullet}>•</ThemedText>
            <ThemedText style={styles.category}>{category}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageRow: {
    width: '100%',
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2a2a2a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
  },
  infoRow: {
    padding: 12,
    width: '100%',
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
    color: '#fff',
  },
  metaInfo: {
    justifyContent: 'flex-start',
  },
  instructor: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCount: {
    fontSize: 14,
    color: '#999',
  },
  bullet: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 4,
  },
  category: {
    fontSize: 14,
    color: '#999',
  },
}); 