import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import CustomText from '../../../components/CustomText';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DraggableTaskCard from '../../../components/DraggableTaskCard';
import FloatingButton from '../../../components/FloatingButton';
import {
  moveTask,
  addTask,
  setCurrentProject,
  setProjects,
} from '../../../redux/slices/projectsSlice';
import {syncOnTaskUpdate, syncOnProjectSwitch} from '../../../redux/services/syncService';
import {Task} from '../../../redux/slices/projectsSlice';
import {getTasksByStatus} from '../../../utils/calculations';
import {useTheme} from '../../../hooks/useTheme';
import { topInset } from '../../../themes/spacing';
import fontSizes from '../../../themes/fontSizes';
import { fontFamily } from '../../../assets/fonts/fontFamily';
import {AppConstants} from '../../../utils/appConstants';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 48) / 3;

const KanbanBoardScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {theme} = useTheme();
  const projects = useSelector((state: any) => state.projects.projects);
  const currentProjectId = useSelector(
    (state: any) => state.projects.currentProjectId,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState<
    'todo' | 'inProgress' | 'done'
  >('todo');
  const [taskTitle, setTaskTitle] = useState('');
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const currentProject = projects.find((p: any) => p.id === currentProjectId);

  useEffect(() => {
    if (currentProject) {
      syncOnProjectSwitch(
        projects,
        (syncedData) => {
          dispatch(setProjects(syncedData));
        },
        () => {
          dispatch(setProjects([]));
        },
      );
    }
  }, [currentProjectId, dispatch]);

  if (!currentProject) {
    return (
      <View style={[styles.container, {backgroundColor: theme.bgColor}]}>
        <CustomText style={[styles.errorText, {color: theme.todo}]}>Project not found</CustomText>
      </View>
    );
  }

  const todoTasks = getTasksByStatus(currentProject.tasks, 'todo');
  const inProgressTasks = getTasksByStatus(
    currentProject.tasks,
    'inProgress',
  );
  const doneTasks = getTasksByStatus(currentProject.tasks, 'done');

  const handleAddTask = useCallback(() => {
    if (taskTitle.trim()) {
      const updatedProjects = projects.map((project: any) => {
        if (project.id === currentProjectId) {
          const newTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: taskTitle.trim(),
            description: '',
            dueDate: null,
            assignedUser: '',
            estimatedHours: 0,
            status: selectedColumn,
            imageUri: null,
            projectId: currentProjectId!,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...project,
            tasks: [...project.tasks, newTask],
            updatedAt: new Date().toISOString(),
          };
        }
        return project;
      });

      dispatch(
        addTask({
          projectId: currentProjectId!,
          task: {
            title: taskTitle.trim(),
            description: '',
            dueDate: null,
            assignedUser: '',
            estimatedHours: 0,
            status: selectedColumn,
            imageUri: null,
          },
        }),
      );
      setTaskTitle('');
      setModalVisible(false);
      syncOnProjectSwitch(
        updatedProjects,
        (syncedData) => {
          dispatch(setProjects(syncedData));
        },
        () => {
          dispatch(setProjects([]));
        },
      );
    } else {
      Alert.alert(AppConstants.alerts.error, AppConstants.tasks.enterTaskTitle);
    }
  }, [taskTitle, selectedColumn, currentProjectId, dispatch, projects]);

  const handleTaskPress = useCallback(
    (task: Task) => {
      (navigation as any).navigate('TaskDetails', {task});
    },
    [navigation],
  );

  const handleDragStart = useCallback((task: Task) => {
  }, []);

  const handleDragEnd = useCallback(
    (taskId: string, newStatus: 'todo' | 'inProgress' | 'done') => {
      if (currentProjectId) {
        const updatedProjects = projects.map((project: any) => {
          if (project.id === currentProjectId) {
            const updatedTasks = project.tasks.map((task: any) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                };
              }
              return task;
            });
            return {
              ...project,
              tasks: updatedTasks,
              updatedAt: new Date().toISOString(),
            };
          }
          return project;
        });

        dispatch(moveTask({projectId: currentProjectId, taskId, newStatus}));
        syncOnProjectSwitch(
          updatedProjects,
          (syncedData) => {
            dispatch(setProjects(syncedData));
          },
          () => {
            dispatch(setProjects([]));
          },
        );
      }
      setDraggedTask(null);
      setHoveredColumn(null);
    },
    [currentProjectId, dispatch, projects],
  );

  const renderTask = useCallback(
    (task: Task, status: 'todo' | 'inProgress' | 'done') => {
      return (
        <DraggableTaskCard
          task={task}
          onPress={() => handleTaskPress(task)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onHoverColumn={setHoveredColumn}
        />
      );
    },
    [handleTaskPress, handleDragStart, handleDragEnd],
  );

  const renderColumn = useCallback(
    (
      title: string,
      tasks: Task[],
      status: 'todo' | 'inProgress' | 'done',
      color: string,
    ) => {
      const isHovered = hoveredColumn === status;
      const columnStyle = useAnimatedStyle(() => {
        return {
          backgroundColor: isHovered
            ? withSpring(theme.isDarkTheme ? '#2D3748' : '#E3F2FD')
            : withSpring(theme.cardBg),
          transform: [
            {scale: isHovered ? withSpring(1.02) : withSpring(1)},
          ],
        };
      });

      return (
        <Animated.View style={[styles.column, columnStyle]}>
          <View style={[styles.columnHeader, {borderTopColor: color}]}>
            <CustomText style={[styles.columnTitle, {color: theme.textPrimary}]}>{title}</CustomText>
            <CustomText style={[styles.columnCount, {color: theme.textTertiary, backgroundColor: theme.isDarkTheme ? '#374151' : '#F5F5F5'}]}>{tasks.length}</CustomText>
          </View>
          <FlatList
            data={tasks}
            renderItem={({item}) => renderTask(item, status)}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.columnContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
            ListEmptyComponent={
              <View style={styles.emptyColumn}>
                <CustomText style={[styles.emptyColumnText, {color: theme.textTertiary}]}>{AppConstants.tasks.noTask}</CustomText>
              </View>
            }
          />
          <TouchableOpacity
            style={[styles.addTaskButton, {borderTopColor: theme.borderColor}]}
            onPress={() => {
              setSelectedColumn(status);
              setModalVisible(true);
            }}>
            <CustomText style={[styles.addTaskButtonText, {color: theme.primaryColor}]}>+ Add Task</CustomText>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [hoveredColumn, renderTask, theme],
  );

  return (
    <GestureHandlerRootView style={[styles.container, {backgroundColor: theme.bgColor}]}>
      <View style={[styles.header, {borderBottomColor: theme.borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <CustomText style={[styles.backButtonText, {color: theme.primaryColor}]}>Back</CustomText>
        </TouchableOpacity>
        <CustomText style={[styles.headerTitle, {color: theme.textPrimary}]} numberOfLines={1}>
          {currentProject.title}
        </CustomText>
      </View>

      <View style={styles.board}>
        {renderColumn('To Do', todoTasks, 'todo', theme.todo)}
        {renderColumn('In Progress', inProgressTasks, 'inProgress', theme.inProgress)}
        {renderColumn('Done', doneTasks, 'done', theme.done)}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: theme.modalBg}]}>
            <CustomText style={[styles.modalTitle, {color: theme.modalText}]}>New Task</CustomText>
            <TextInput
              allowFontScaling={false}
              style={[
                styles.input,
                {
                  borderColor: theme.borderColor,
                  color: theme.modalText,
                },
              ]}
              placeholder="Enter task title"
              placeholderTextColor={theme.textTertiary}
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setTaskTitle('');
                }}>
                <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleAddTask}>
                <CustomText style={styles.createButtonText}>Create</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: topInset,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  headerTitle: {
    fontSize: fontSizes.f24,
    fontFamily: fontFamily.bold,
    marginBottom: 4,
    flex: 1,
  },
  board: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 4,
    marginBottom: 8,
  },
  columnTitle: {
    fontSize: fontSizes.f15,
    fontFamily: fontFamily.bold,
  },
  columnCount: {
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.regular,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  columnContent: {
    flexGrow: 1,
    paddingVertical: 4,
  },
  taskSeparator: {
    height: 8,
  },
  emptyColumn: {
    padding: 20,
    alignItems: 'center',
  },
  emptyColumnText: {
    fontSize: 14,
  },
  addTaskButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 8,
  },
  addTaskButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontFamily: fontFamily.bold,
  },
  createButton: {
    backgroundColor: '#2196F3',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default KanbanBoardScreen;

