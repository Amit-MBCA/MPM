import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import CustomText from '../CustomText';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useTheme} from '../../hooks/useTheme';
import fontSizes from '../../themes/fontSizes';
import { topInset } from '../../themes/spacing';

interface FloatingButtonProps {
  onPress: () => void;
  label?: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  label = '+',
}) => {
  const {theme} = useTheme();
  const scale = useSharedValue(1);
  const isLongLabel = label.length > 3;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.button,
          isLongLabel && styles.buttonLong,
          {backgroundColor: theme.primaryColor},
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}>
        <CustomText style={[styles.label, {color: theme.isDarkTheme ? theme.cardBg : theme.white}]}>
          {'+'}
        </CustomText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: topInset,
    right: 24,
    zIndex: 1000,
  },
  button: {
    minWidth: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonLong: {
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: fontSizes.f36,
    fontWeight: '600',
  },
});

export default FloatingButton;

