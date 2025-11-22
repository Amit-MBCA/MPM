import React from 'react';
import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {toggleTheme} from '../../redux/slices/globalSlice';
import {appImages} from '../../themes/appImages';
const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkTheme = useSelector((state: any) => state.global.isDarkTheme);
  const translateX = useSharedValue(isDarkTheme ? 1 : 0);

  React.useEffect(() => {
    translateX.value = withSpring(isDarkTheme ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDarkTheme]);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const animatedSwitchStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value * 28}],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, 1],
      ['#4A5568', '#2196F3'], // Dark: gray, Light: primary blue
    );
    return {
      backgroundColor,
    };
  });

  const moonRotation = useAnimatedStyle(() => {
    return {
      opacity: isDarkTheme ? 1 : 0, // Show moon in dark theme
      transform: [{rotate: `${translateX.value * 360}deg`}],
    };
  });

  const sunRotation = useAnimatedStyle(() => {
    return {
      opacity: isDarkTheme ? 0 : 1, // Show sun in light theme
      transform: [{rotate: `${(1 - translateX.value) * 360}deg`}],
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleToggle}
      style={styles.container}>
      <Animated.View style={[styles.track, animatedBackgroundStyle]}>
        <Animated.View style={[styles.thumb, animatedSwitchStyle]}>
          <View style={styles.thumbInner}>
            <Animated.View style={[styles.iconContainer, moonRotation]}>
              <Image source={appImages.moon} style={styles.moonIcon} />
              
            </Animated.View>
            <Animated.View style={[styles.iconContainer, sunRotation]}>
              <Image source={appImages.sun} style={styles.sunIcon} />
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },
  moonIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: undefined, // Use original image colors
  },
  sunIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: undefined, // Use original image colors
  },
});

export default ThemeToggle;

