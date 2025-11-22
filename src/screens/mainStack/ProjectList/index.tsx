import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import CustomText from '../../../components/CustomText';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import ProjectCard from '../../../components/ProjectCard';
import FloatingButton from '../../../components/FloatingButton';
import {addProject, setProjects, setCurrentProject, deleteProject} from '../../../redux/slices/projectsSlice';
import {loadProjectsFromStorage} from '../../../redux/slices/projectsSlice';
import {syncOnAppOpen} from '../../../redux/services/syncService';
import {Project} from '../../../redux/slices/projectsSlice';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RectButton} from 'react-native-gesture-handler';
import { height, topInset, width } from '../../../themes/spacing'; 
import { fontFamily } from '../../../assets/fonts/fontFamily';
import fontSizes from '../../../themes/fontSizes';
import {useTheme} from '../../../hooks/useTheme';
import ThemeToggle from '../../../components/ThemeToggle';
import {AppConstants} from '../../../utils/appConstants';

const ProjectListScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const projects = useSelector((state: any) => state.projects.projects);
  const {theme} = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const swipeableRefs = useRef<{[key: string]: Swipeable | null}>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredProjects(projects);
      } else {
        const filtered = projects.filter((project: Project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
        setFilteredProjects(filtered);
      }
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, projects]);

  useFocusEffect(
    useCallback(() => {
      setShouldAnimate(true);
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 1100); // Slightly longer than animation duration
      
      return () => {
        clearTimeout(timer);
      };
    }, [])
  );

  const loadInitialData = async () => {
    try {
      const storedProjects = await loadProjectsFromStorage();
      syncOnAppOpen(
        storedProjects,
        (syncedData) => {
          dispatch(setProjects(syncedData));
        },
        () => {
          dispatch(setProjects([]));
        },
      );
    } catch (error) {
      dispatch(setProjects([]));
    }
  };

  const handleAddProject = useCallback(() => {
    if (projectTitle.trim()) {
      dispatch(
        addProject({
          title: projectTitle.trim(),
          tasks: [],
        }),
      );
      setProjectTitle('');
      setModalVisible(false);
    } else {
      Alert.alert(AppConstants.alerts.error, AppConstants.projects.enterProjectTitle);
    }
  }, [projectTitle, dispatch]);

  const handleProjectPress = useCallback(
    (projectId: string) => {
      dispatch(setCurrentProject(projectId));
      navigation.navigate('KanbanBoard' as never);
    },
    [dispatch, navigation],
  );

  const handleDeleteProject = useCallback(() => {
    if (projectToDelete) {
      dispatch(deleteProject(projectToDelete.id));
      setDeleteModalVisible(false);
      setProjectToDelete(null);
    }
  }, [projectToDelete, dispatch]);

  const handleSwipeLeftToRight = useCallback((project: Project) => {
    setProjectToDelete(project);
    setDeleteModalVisible(true);
    swipeableRefs.current[project.id]?.close();
  }, []);

  const handleSwipeRightToLeft = useCallback((project: Project) => {
    swipeableRefs.current[project.id]?.close();
    handleProjectPress(project.id);
  }, [handleProjectPress]);

  const renderLeftActions = useCallback((project: Project) => {
    return (
      <RectButton
        style={[styles.leftAction, {backgroundColor: theme.todo}]}
        onPress={() => handleSwipeLeftToRight(project)}>
        <View style={styles.actionContent}>
          <CustomText style={styles.actionText}>{AppConstants.buttons.delete}</CustomText>
        </View>
      </RectButton>
    );
  }, [handleSwipeLeftToRight, theme.todo]);

  const renderRightActions = useCallback((project: Project) => {
    const rightActionBgColor = theme.isDarkTheme ? '#FFFFFF' : theme.primaryColor;
    const rightActionTextColor = theme.isDarkTheme ? '#1A1A1A' : '#FFFFFF';
    
    return (
      <RectButton
        style={[styles.rightAction, {backgroundColor: rightActionBgColor}]}
        onPress={() => handleSwipeRightToLeft(project)}>
        <View style={styles.actionContent}>
          <CustomText style={[styles.actionText, {color: rightActionTextColor}]}>{AppConstants.buttons.open}</CustomText>
        </View>
      </RectButton>
    );
  }, [handleSwipeRightToLeft, theme.isDarkTheme, theme.primaryColor]);

  const renderProject = useCallback(
    ({item, index}: {item: Project; index: number}) => (
      <Animated.View 
        entering={FadeInDown.delay(index * 100)}
        style={styles.animatedViewWrapper}
      >
        <Swipeable
          ref={(ref) => {
            swipeableRefs.current[item.id] = ref;
          }}
          renderLeftActions={() => renderLeftActions(item)}
          renderRightActions={() => renderRightActions(item)}
          onSwipeableOpen={(direction) => {
            if (direction === 'left') {
              handleSwipeLeftToRight(item);
            } else if (direction === 'right') {
              handleSwipeRightToLeft(item);
            }
          }}
          containerStyle={styles.swipeableContainer}
        >
          <ProjectCard project={item} onPress={handleProjectPress} shouldAnimate={shouldAnimate} />
        </Swipeable>
      </Animated.View>
    ),
    [handleProjectPress, renderLeftActions, renderRightActions, handleSwipeLeftToRight, handleSwipeRightToLeft, shouldAnimate],
  );

  const keyExtractor = useCallback((item: Project) => item.id, []);

  const displayProjects = searchQuery.trim() ? filteredProjects : projects;
  const displayCount = searchQuery.trim() ? filteredProjects.length : projects.length;

  return (
    <View style={[styles.container, {backgroundColor: theme.bgColor}]}>
      <View style={[styles.header, {borderBottomColor: theme.borderColor}]}>
        <View style={styles.headerLeft}>
          <CustomText style={[styles.headerTitle, {color: theme.textPrimary}]}>{AppConstants.projects.myProjects}</CustomText>
          <CustomText style={[styles.headerSubtitle, {color: theme.textSecondary}]}>
              {displayCount} {displayCount === 1 || displayCount === 0 ? AppConstants.projects.project : AppConstants.projects.projects}
          </CustomText>
        </View>
        <ThemeToggle />
      </View>

      {(displayCount > 0 || searchQuery?.length) && (
        <View style={styles.searchContainer}>
        <TextInput
          allowFontScaling={false}
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.searchBg,
              borderColor: theme.searchBorder,
              color: theme.textPrimary,
            },
          ]}
              placeholder={AppConstants.search.searchProjects}
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text.trimStart())}
            maxLength={100}
          />
        </View>
      )}ß

      <FlatList
        data={displayProjects}
        renderItem={renderProject}
        keyExtractor={keyExtractor}
        contentContainerStyle={
          displayProjects.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        style={styles.flatListStyle}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CustomText style={[styles.emptyText, {color: theme.textPrimary}]}>
              {searchQuery.trim() ? AppConstants.projects.noProjects : AppConstants.projects.noProjects}
            </CustomText>
            <CustomText style={[styles.emptySubtext, {color: theme.textSecondary}]}>
              {searchQuery.trim()
                ? AppConstants.projects.createNewProject
                : AppConstants.projects.createNewProject}
            </CustomText>
          </View>
        }
      />

      <FloatingButton
        onPress={() => setModalVisible(true)}
        label="+"
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: theme.modalBg}]}>
            <CustomText style={[styles.modalTitle, {color: theme.modalText}]}>New Project</CustomText>
            <TextInput
              allowFontScaling={false}
              style={[
                styles.input,
                styles.modalInput,
                {
                  backgroundColor: theme.isDarkTheme ? '#F9FAFB' : '#FFFFFF',
                  borderColor: theme.borderColor,
                  color: theme.modalText,
                },
              ]}
              placeholder={AppConstants.projects.enterProjectTitle}
              placeholderTextColor={theme.textTertiary}
              value={projectTitle}
              onChangeText={(text) => setProjectTitle(text.trimStart())}
              autoFocus
              maxLength={100}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  {backgroundColor: theme.isDarkTheme ? '#374151' : '#F5F5F5'},
                ]}
                onPress={() => {
                  setModalVisible(false);
                  setProjectTitle('');
                }}>
                <CustomText style={[
                  styles.cancelButtonText,
                  styles.cancelButtonTextDynamic,
                  {color: theme.isDarkTheme ? '#E5E7EB' : theme.textTertiary}
                ]}>{AppConstants.buttons.cancel}</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
                  styles.createButtonDynamic,
                  {backgroundColor: theme.isDarkTheme ? '#2196F3' : theme.primaryColor},
                ]}
                onPress={handleAddProject}>
                <CustomText style={styles.createButtonText}>{AppConstants.buttons.create}</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDeleteModalVisible(false);
          setProjectToDelete(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: theme.modalBg}]}>
            <CustomText style={[styles.modalTitle, {color: theme.modalText}]}>{AppConstants.projects.deleteProject}{" "}{projectToDelete?.title}</CustomText>
            <CustomText style={[styles.deleteModalText, {color: theme.modalText}]}>
              {AppConstants.projects.areYouSureDelete} {projectToDelete?.title}?
            </CustomText>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  styles.cancelButtonDynamic,
                  {backgroundColor: theme.isDarkTheme ? '#374151' : '#F5F5F5'},
                ]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setProjectToDelete(null);
                }}>
                <CustomText style={[styles.cancelButtonText, {color: theme.textTertiary}]}>{AppConstants.buttons.cancel}</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.deleteButton,
                  styles.deleteButtonDynamic,
                  {backgroundColor: theme.todo},
                ]}
                onPress={handleDeleteProject}>
                <CustomText style={styles.deleteButtonText}>{AppConstants.buttons.delete}</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSizes.f16,
    fontFamily: fontFamily.regular,
    borderWidth: 1,
  },
  header: {
    padding: 20,
    paddingTop: topInset,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSizes.f28,
    fontFamily: fontFamily.bold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.regular,
  },
  listContent: {
    paddingHorizontal: 12, // Reduced from 16 to account for card margin
    paddingBottom: width * 0.3,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    fontSize: fontSizes.f18,
    fontFamily: fontFamily.regular,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: fontSizes.f14,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
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
    fontSize: fontSizes.f22,
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
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  createButton: {
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  deleteButton: {
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  animatedViewWrapper: {
    overflow: 'visible',
  },
  swipeableContainer: {
    overflow: 'visible',
  },
  flatListStyle: {
    overflow: 'visible',
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    color: '#1A1A1A',
  },
  cancelButtonDynamic: {
    backgroundColor: '#F5F5F5',
  },
  createButtonDynamic: {
    backgroundColor: '#2196F3',
  },
  deleteButtonDynamic: {
    backgroundColor: '#FF6B6B',
  },
  cancelButtonTextDynamic: {
    color: '#666666',
  },
});

export default ProjectListScreen;

