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
  onDragStart: (task: Task, pos: {x: number; y: number}) => void; // notifies parent to show floating clone
  onDragMove: (pos: {x: number; y: number}) => void; // updates floating clone position
  onDragEnd: (taskId: string, newStatus: 'todo' | 'inProgress' | 'done') => void;
  onHoverColumn: (column: string | null) => void;
  isHidden?: boolean;
  clearActiveDraggedTask: () => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onPress,
  onDragStart,
  onDragEnd,
  onDragMove,
  onHoverColumn,
  isHidden = false,
  clearActiveDraggedTask
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const pan = Gesture.Pan()
    .onStart((e) => {
      isDragging.value = true;
      runOnJS(onDragStart)(task, {x: e.absoluteX, y: e.absoluteY});
      scale.value = withSpring(1.05);
      opacity.value = withSpring(0.8);
    })
    .onUpdate(e => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;

      const columnWidth = SCREEN_WIDTH / 3;
      const absoluteX = e.absoluteX;
      runOnJS(onDragMove)({x: e.absoluteX, y: e.absoluteY});

      if (absoluteX < columnWidth) {
        runOnJS(onHoverColumn)('todo');
      } else if (absoluteX < columnWidth * 2) {
        runOnJS(onHoverColumn)('inProgress');
      } else {
        runOnJS(onHoverColumn)('done');
      }
    })
    .onEnd(e => {

      isDragging.value = false;
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
      }else{
        runOnJS(clearActiveDraggedTask)();
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
      // opacity: opacity.value,
      opacity: isDragging.value || isHidden ? 0 : 1
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
