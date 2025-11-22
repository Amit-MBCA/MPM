import React, {memo} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import CustomText from '../CustomText';
import {Task} from '../../redux/slices/projectsSlice';
import {useTheme} from '../../hooks/useTheme';
import moment from 'moment';
import { fontFamily } from '../../assets/fonts/fontFamily';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({task, onPress}) => {
  const {theme} = useTheme();
  
  return (
    <TouchableOpacity style={[styles.container, {backgroundColor: theme.cardBg}]} onPress={onPress} activeOpacity={0.7}>
      {task.imageUri && (
        <Image source={{uri: task.imageUri}} style={styles.image} />
      )}
      <View style={styles.content}>
        <CustomText style={[styles.title, {color: theme.textPrimary}]} numberOfLines={2}>
          {task.title}
        </CustomText>
        {task.description && (
          <CustomText style={[styles.description, {color: theme.textTertiary}]} numberOfLines={2}>
            {task.description}
          </CustomText>
        )}
        {task.dueDate && (
          <CustomText style={[styles.dueDate, {color: theme.todo}]}>
            Due: {moment(task.dueDate, 'DD-MM-YYYY', true).isValid() 
              ? task.dueDate 
              : moment(task.dueDate).format('DD-MM-YYYY')}
          </CustomText>
        )}
        {task.assignedUser && (
          <CustomText style={[styles.assignedUser, {color: theme.textTertiary}]}>👤 {task.assignedUser}</CustomText>
        )}
        {task.estimatedHours > 0 && (
          <CustomText style={[styles.hours, {color: theme.textTertiary}]}>⏱ {task.estimatedHours}h</CustomText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 6,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 12,
    marginTop: 4,
  },
  assignedUser: {
    fontSize: 12,
    marginTop: 4,
  },
  hours: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default memo(TaskCard);

