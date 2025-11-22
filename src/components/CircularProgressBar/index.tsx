import React, {useEffect, useState, useRef, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import CustomText from '../CustomText';
import {PieChart} from 'react-native-gifted-charts';
import { fontFamily } from '../../assets/fonts/fontFamily';
import fontSizes from '../../themes/fontSizes';

interface CircularProgressBarProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  shouldAnimate?: boolean;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  size = 60,
  strokeWidth = 6,
  animated = true,
  shouldAnimate = false,
}) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPercentageRef = useRef<number>(-1);
  const previousShouldAnimateRef = useRef<boolean>(false);
  const hasAnimatedRef = useRef<boolean>(false);
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const radius = size / 2;
  const innerRadius = radius - strokeWidth;

  useEffect(() => {
    const percentageChanged = previousPercentageRef.current !== clampedPercentage;
    const shouldAnimateJustTurnedOn = shouldAnimate && !previousShouldAnimateRef.current;
    
    const prevPercentage = previousPercentageRef.current;
    const prevShouldAnimate = previousShouldAnimateRef.current;
    previousPercentageRef.current = clampedPercentage;
    previousShouldAnimateRef.current = shouldAnimate;

    if (!shouldAnimate && prevShouldAnimate) {
      hasAnimatedRef.current = false;
    }

    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    if (shouldAnimateJustTurnedOn && animated && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      setDisplayPercentage(0);
      
      const duration = 1000;
      const startTime = Date.now();
      const startValue = 0;
      const endValue = clampedPercentage;
      
      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = startValue + (endValue - startValue) * progress;
        setDisplayPercentage(currentValue);
        
        if (progress < 1) {
          animationRef.current = setTimeout(animate, 16);
        } else {
          setDisplayPercentage(endValue);
          animationRef.current = null;
        }
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
          animationRef.current = null;
        }
      };
    } else if (percentageChanged && !shouldAnimate) {
      setDisplayPercentage(clampedPercentage);
    } else if (!animated || !shouldAnimate) {
      setDisplayPercentage(clampedPercentage);
    }
  }, [clampedPercentage, animated, shouldAnimate]);

  const progressData = useMemo(() => [
    {value: displayPercentage, color: '#4CAF50'},
    {value: Math.max(100 - displayPercentage, 0), color: Math.round(percentage) == 0 ? '#FF6B6B' : '#FFA726'},
  ], [displayPercentage]);

  const centerLabel = useMemo(() => (
    <CustomText style={[styles.percentageText, {fontSize: fontSizes.f16, color: Math.round(percentage) == 100 || Math.round(percentage) == 0 ? '#fff' : '#1A1A1A'}]}>
      {Math.round(displayPercentage)}%
    </CustomText>
  ), [displayPercentage, size, percentage]);

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <PieChart
        data={progressData}
        donut
        radius={radius}
        innerRadius={innerRadius}
        innerCircleColor="transparent"
        centerLabelComponent={() => centerLabel}
        isAnimated={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  percentageText: {
    fontFamily: fontFamily.boldItalic,
    color: '#1A1A1A',
  },
});

export default CircularProgressBar;

