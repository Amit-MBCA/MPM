import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import LottieView from 'lottie-react-native';
import CustomText from '../CustomText';
import {useTheme} from '../../hooks/useTheme';
import {width, height} from '../../themes/spacing';
import fontSizes from '../../themes/fontSizes';
import {fontFamily} from '../../assets/fonts/fontFamily';
import {AppConstants} from '../../utils/appConstants';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  const {theme} = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish, fadeAnim, scaleAnim, rotateAnim]);

  let lottieSource = null;
  try {
    lottieSource = require('../../assets/animations/splash.json');
  } catch (e) {
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
      <Animated.View
        style={[
          styles.container,
          styles.animatedContainer,
          {backgroundColor: theme.bgColor, opacity: fadeAnim},
        ]}>
      <Animated.View
        style={[
          styles.content,
          styles.animatedContent,
          {
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <View style={styles.animationContainer}>
          {lottieSource ? (
            <LottieView
              source={lottieSource}
              autoPlay
              loop
              style={styles.animation}
            />
          ) : (
            <Animated.View
              style={[
                styles.fallbackAnimation,
                styles.animatedFallback,
                {
                  transform: [{rotate: spin}],
                  borderColor: theme.primaryColor,
                },
              ]}>
              <View style={[styles.iconCircle, {borderColor: theme.primaryColor}]}>
                <CustomText style={[styles.iconText, {color: theme.primaryColor}]}>
                  📋
                </CustomText>
              </View>
            </Animated.View>
           )} 
        </View>
        <CustomText style={[styles.appName, {color: theme.primaryColor}]}>
          {AppConstants.appName}
        </CustomText>
        <CustomText style={[styles.tagline, {color: theme.textTertiary}]}>
          {AppConstants.tagline}
        </CustomText>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 9999,
  },
  animatedContainer: {
    opacity: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedContent: {
    transform: [{scale: 1}],
  },
  animationContainer: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  fallbackAnimation: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 75,
    borderWidth: 4,
  },
  animatedFallback: {
    transform: [{rotate: '0deg'}],
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconText: {
    fontSize: 60,
  },
  appName: {
    fontSize: fontSizes.f40,
    fontFamily: fontFamily.bold,
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: fontSizes.f16,
    fontFamily: fontFamily.regular,
    letterSpacing: 1,
  },
});

export default SplashScreen;