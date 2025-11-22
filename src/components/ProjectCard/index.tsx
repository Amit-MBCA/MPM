import React, {memo} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import CustomText from '../CustomText';
import CircularProgressBar from '../CircularProgressBar';
import {Project} from '../../redux/slices/projectsSlice';
import {calculateCompletionPercentage, getTotalTasks} from '../../utils/calculations';
import {useTheme} from '../../hooks/useTheme';
import {AppConstants} from '../../utils/appConstants';
import fontSizes from '../../themes/fontSizes';
import { fontFamily } from '../../assets/fonts/fontFamily';

interface ProjectCardProps {
  project: Project;
  onPress: (projectId: string) => void;
  shouldAnimate?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({project, onPress, shouldAnimate = false}) => {
  const {theme} = useTheme();
  const completionPercentage = calculateCompletionPercentage(project);
  const totalTasks = getTotalTasks(project);

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: theme.cardBg}]}
      onPress={() => onPress(project.id)}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <CustomText style={[styles.title, {color: theme.textPrimary}]} numberOfLines={1}>
              {project.title} 
            </CustomText>
            <View style={styles.statsContainer}>
              <CustomText style={[styles.statsText, {color: theme.textTertiary}]}>{totalTasks} {totalTasks < 2 ? AppConstants.tasks.task : AppConstants.tasks.tasks}</CustomText>
            </View>
          </View>
          <CircularProgressBar
            percentage={completionPercentage}
            size={60}
            strokeWidth={6}
            shouldAnimate={shouldAnimate}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 4, // Add horizontal margin to prevent shadow clipping
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: fontSizes.f18,
    fontFamily: fontFamily.boldItalic,
    marginBottom: 8,
  },
  statsContainer: {
    marginBottom: 0,
  },
  statsText: {
    fontSize: fontSizes.f14, 
    fontFamily: fontFamily.regular,
  },
});

export default memo(ProjectCard);

