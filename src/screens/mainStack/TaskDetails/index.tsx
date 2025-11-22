import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import CustomText from '../../../components/CustomText';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {
  updateTask,
  deleteTask,
  setProjects,
} from '../../../redux/slices/projectsSlice';
import {Task} from '../../../redux/slices/projectsSlice';
import {useTheme} from '../../../hooks/useTheme';
import {clearSyncTimeout} from '../../../helper/commonFunction';
import { goBack } from '../../../navigations/navigationServices';
import { syncOnTaskUpdate } from '../../../redux/services/syncService';
import {AppConstants} from '../../../utils/appConstants';

interface RouteParams {
  task: Task;
}

const TaskDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {theme} = useTheme();
  const projects = useSelector((state: any) => state.projects.projects);
  const currentProjectId = useSelector(
    (state: any) => state.projects.currentProjectId,
  );

  const {task: initialTask} = (route.params as RouteParams) || {};

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(
    initialTask?.description || '',
  );
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate
      ? moment(initialTask.dueDate, 'DD-MM-YYYY').format('DD-MM-YYYY')
      : ''
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [assignedUser, setAssignedUser] = useState(
    initialTask?.assignedUser || '',
  );
  const [estimatedHours, setEstimatedHours] = useState(
    initialTask?.estimatedHours?.toString() || '0',
  );
  const [status, setStatus] = useState<
    'todo' | 'inProgress' | 'done'
  >(initialTask?.status || 'todo');
  const [imageUri, setImageUri] = useState(initialTask?.imageUri || null);

  useEffect(() => {
    if (!initialTask) {
      Alert.alert(AppConstants.alerts.error, AppConstants.tasks.taskNotFound, [
        {text: AppConstants.buttons.ok, onPress: () => navigation.goBack()},
      ]);
    }

    return () => {
      clearSyncTimeout();
    };
  }, [initialTask, navigation]);

  const handleSave = useCallback(() => {
    if (!currentProjectId || !initialTask) return;

    let formattedDueDate = null;
    if (dueDate && dueDate.trim()) {
      if (moment(dueDate, 'DD-MM-YYYY', true).isValid()) {
        formattedDueDate = dueDate.trim();
      } else {
        const parsedDate = moment(dueDate);
        if (parsedDate.isValid()) {
          formattedDueDate = parsedDate.format('DD-MM-YYYY');
        }
      }
    }
    const updatedProjects = projects.map((project: any) => {
      if (project.id === currentProjectId) {
        const updatedTasks = project.tasks.map((task: any) => {
          if (task.id === initialTask.id) {
            return {
              ...task,
              title: title.trim(),
              description: description.trim(),
              dueDate: formattedDueDate,
              assignedUser: assignedUser.trim(),
              estimatedHours: parseInt(estimatedHours) || 0,
              status,
              imageUri,
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

    dispatch(
      updateTask({
        projectId: currentProjectId,
        taskId: initialTask.id,
        updates: {
          title: title.trim(),
          description: description.trim(),
          dueDate: formattedDueDate,
          assignedUser: assignedUser.trim(),
          estimatedHours: parseInt(estimatedHours) || 0,
          status,
          imageUri,
        },
      }),
    );

    syncOnTaskUpdate(
      updatedProjects,
      (syncedData) => {
        navigation.goBack();
      },
      () => {},
    );
  }, [
    currentProjectId,
    initialTask,
    title,
    description,
    dueDate,
    assignedUser,
    estimatedHours,
    status,
    imageUri,
    dispatch,
    projects,
  ]);

  const handleDelete = useCallback(() => {
    if (!currentProjectId || !initialTask) return;

    Alert.alert(
      AppConstants.tasks.deleteTask,
      AppConstants.tasks.areYouSureDeleteTask,
      [
        {text: AppConstants.buttons.cancel, style: 'cancel'},
        {
          text: AppConstants.buttons.delete,
          style: 'destructive',
          onPress: () => {
            dispatch(
              deleteTask({
                projectId: currentProjectId,
                taskId: initialTask.id,
              }),
            );
            syncOnTaskUpdate(
              projects,
              (syncedData) => {
                dispatch(setProjects(syncedData));
              },
              () => {
                dispatch(setProjects([]));
              },
            );
            navigation.goBack();
          },
        },
      ],
    );
  }, [currentProjectId, initialTask, dispatch, projects, navigation]);

  const handleImagePicker = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
    };
    
    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0] && response.assets[0].uri) {
        setImageUri(response.assets[0].uri);
      }
    });
  }, []);

  const handleDateConfirm = useCallback((date: Date) => {
    const formattedDate = moment(date).format('DD-MM-YYYY');
    setDueDate(formattedDate);
    setDatePickerVisibility(false);
  }, []);

  const handleDateCancel = useCallback(() => {
    setDatePickerVisibility(false);
  }, []);

  const getDateForPicker = useCallback(() => {
    if (dueDate && moment(dueDate, 'DD-MM-YYYY', true).isValid()) {
      return moment(dueDate, 'DD-MM-YYYY').toDate();
    }
    return new Date();
  }, [dueDate]);

  if (!initialTask) {
    return null;
  }

  const statusOptions: Array<'todo' | 'inProgress' | 'done'> = [
    'todo',
    'inProgress',
    'done',
  ];
  const statusLabels = {
    todo: AppConstants.tasks.todo,
    inProgress: AppConstants.tasks.inProgress,
    done: AppConstants.tasks.done,
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.bgColor}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <Animated.View entering={FadeIn} style={styles.animatedContainer}>
        <View style={[styles.header, {borderBottomColor: theme.borderColor}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <CustomText style={[styles.backButtonText, {color: theme.primaryColor}]}>Back</CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}>
            <CustomText style={[styles.saveButtonText, {color: theme.primaryColor}]}>{AppConstants.buttons.save}</CustomText>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{uri: imageUri}} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImageUri(null)}>
              <CustomText style={[styles.removeImageButtonText, {color: theme.todo}]}>Remove</CustomText>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.uploadButton, {backgroundColor: theme.primaryColor}]}
          onPress={handleImagePicker}>
          <CustomText style={[styles.uploadButtonText, styles.uploadButtonTextDynamic, {color: theme.isDarkTheme ? theme.secondaryColor : '#FFFFFF'}]}>
            {imageUri ? AppConstants.tasks.changeImage : AppConstants.tasks.selectImage}
          </CustomText>
        </TouchableOpacity>

        <View style={styles.fieldContainer}>
          <CustomText style={[styles.label, {color: theme.textPrimary}]}>{AppConstants.tasks.title}</CustomText>
          <TextInput
            allowFontScaling={false}
            style={[
              styles.input,
              styles.inputDynamic,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
                color: theme.textPrimary,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder={AppConstants.tasks.title}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <View style={styles.fieldContainer}>
          <CustomText style={[styles.label, {color: theme.textPrimary}]}>{AppConstants.tasks.description}</CustomText>
          <TextInput
            allowFontScaling={false}
            style={[
              styles.input,
              styles.textArea,
              styles.inputDynamic,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
                color: theme.textPrimary,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder={AppConstants.tasks.description}
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.fieldContainer}>
          <CustomText style={[styles.label, {color: theme.textPrimary}]}>{AppConstants.tasks.dueDate}</CustomText>
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            style={[
              styles.input,
              styles.dateInput,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
              },
            ]}>
            <CustomText style={[
              styles.dateText,
              {
                color: dueDate ? theme.textPrimary : theme.textTertiary,
              },
            ]}>
              {dueDate || 'DD-MM-YYYY'}
            </CustomText>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={handleDateCancel}
            date={getDateForPicker()}
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          />
        </View>

        <View style={styles.fieldContainer}>
          <CustomText style={[styles.label, {color: theme.textPrimary}]}>{AppConstants.tasks.assignedUser}</CustomText>
          <TextInput
            allowFontScaling={false}
            style={[
              styles.input,
              styles.inputDynamic,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
                color: theme.textPrimary,
              },
            ]}
            value={assignedUser}
            onChangeText={setAssignedUser}
            placeholder={AppConstants.tasks.assignedUser}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <View style={styles.fieldContainer}>
          <CustomText style={[styles.label, {color: theme.textPrimary}]}>{AppConstants.tasks.estimatedHours}</CustomText>
          <TextInput
            allowFontScaling={false}
            style={[
              styles.input,
              styles.inputDynamic,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
                color: theme.textPrimary,
              },
            ]}
            value={estimatedHours}
            onChangeText={setEstimatedHours}
            placeholder="0"
            placeholderTextColor={theme.textTertiary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fieldContainer}>
          <CustomText style={[styles.label, {color: theme.textPrimary}]}>{AppConstants.tasks.status}</CustomText>
          <View style={styles.statusContainer}>
            {statusOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.statusOption,
                  styles.statusOptionDynamic,
                  {
                    backgroundColor: status === option 
                      ? (theme.isDarkTheme ? '#2D3748' : '#E3F2FD')
                      : (theme.isDarkTheme ? '#1F2937' : '#F5F5F5'),
                    borderColor: status === option ? theme.primaryColor : 'transparent',
                  },
                ]}
                onPress={() => setStatus(option)}>
                <CustomText
                  style={[
                    styles.statusOptionText,
                    {
                      color: status === option ? theme.primaryColor : theme.textTertiary,
                    },
                  ]}>
                  {statusLabels[option]}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, {backgroundColor: theme.todo}]}
          onPress={handleDelete}>
          <CustomText style={styles.deleteButtonText}>Delete Task</CustomText>
        </TouchableOpacity>
      </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
  },
  backButton: {},
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  removeImageButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  removeImageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputDynamic: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    color: '#F9FAFB',
  },
  uploadButtonTextDynamic: {
    color: '#FFFFFF',
  },
  statusOptionDynamic: {
    backgroundColor: '#1F2937',
    borderColor: 'transparent',
  },
});

export default TaskDetailsScreen;

