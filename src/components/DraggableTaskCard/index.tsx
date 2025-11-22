import React from 'react';
import {Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import TaskCard from '../TaskCard';
import {Task} from '../../redux/slices/projectsSlice';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface DraggableTaskCardProps {
  task: Task;
  onPress: () => void;
  onDragStart: (task: Task) => void;
  onDragEnd: (taskId: string, newStatus: 'todo' | 'inProgress' | 'done') => void;
  onHoverColumn: (column: string | null) => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onPress,
  onDragStart,
  onDragEnd,
  onHoverColumn,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const pan = Gesture.Pan()
    .onStart(() => {
      runOnJS(onDragStart)(task);
      scale.value = withSpring(1.05);
      opacity.value = withSpring(0.8);
    })
    .onUpdate(e => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;

      const columnWidth = SCREEN_WIDTH / 3;
      const absoluteX = e.absoluteX;

      if (absoluteX < columnWidth) {
        runOnJS(onHoverColumn)('todo');
      } else if (absoluteX < columnWidth * 2) {
        runOnJS(onHoverColumn)('inProgress');
      } else {
        runOnJS(onHoverColumn)('done');
      }
    })
    .onEnd(e => {
      const columnWidth = SCREEN_WIDTH / 3;
      const absoluteX = e.absoluteX;

      let newStatus: 'todo' | 'inProgress' | 'done' = task.status;

      if (absoluteX < columnWidth) {
        newStatus = 'todo';
      } else if (absoluteX < columnWidth * 2) {
        newStatus = 'inProgress';
      } else {
        newStatus = 'done';
      }

      if (newStatus !== task.status) {
        runOnJS(onDragEnd)(task.id, newStatus);
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      runOnJS(onHoverColumn)(null);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: translateX.value},
        {translateY: translateY.value},
        {scale: scale.value},
      ],
      opacity: opacity.value,
      zIndex: translateX.value !== 0 || translateY.value !== 0 ? 1000 : 1,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <TaskCard task={task} onPress={onPress} />
      </Animated.View>
    </GestureDetector>
  );
};

export default DraggableTaskCard;

