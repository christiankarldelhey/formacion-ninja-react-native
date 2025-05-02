import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export type CourseItemProps = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  viewCount: string;
  onPress?: () => void;
};

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
      <ThemedView style={styles.thumbnailContainer}>
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} contentFit="cover" />
        <ThemedView style={styles.durationBadge}>
          <ThemedText style={styles.durationText}>{duration}</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.infoContainer}>
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
    flexDirection: 'row',
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: 160,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
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
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  metaInfo: {
    justifyContent: 'flex-start',
  },
  instructor: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCount: {
    fontSize: 14,
    opacity: 0.8,
  },
  bullet: {
    fontSize: 14,
    opacity: 0.8,
    marginHorizontal: 4,
  },
  category: {
    fontSize: 14,
    opacity: 0.8,
  },
}); 