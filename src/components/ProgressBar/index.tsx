import React, {useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 8,
  showLabel = true,
  animated = true,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(percentage, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = percentage;
    }
  }, [percentage, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>{Math.round(percentage)}%</Text>
      )}
      <View style={[styles.track, {height}]}>
        <Animated.View style={[styles.fill, animatedStyle, {height}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  track: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
});

export default ProgressBar;

