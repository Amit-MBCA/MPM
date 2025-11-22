import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  assignedUser: string;
  estimatedHours: number;
  status: 'todo' | 'inProgress' | 'done';
  imageUri: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectsState {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
}

const initialState: ProjectsState = {
  projects: [],
  currentProjectId: null,
  isLoading: false,
};

const STORAGE_KEY = '@projects_data';

const saveToStorage = async (projects: Project[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
  }
};

export const loadProjectsFromStorage = async (): Promise<Project[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      saveToStorage(action.payload);
    },
    addProject: (state, action: PayloadAction<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newProject: Project = {
        ...action.payload,
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.projects.push(newProject);
      saveToStorage(state.projects);
    },
    updateProject: (state, action: PayloadAction<{id: string; updates: Partial<Project>}>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
        saveToStorage(state.projects);
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
      if (state.currentProjectId === action.payload) {
        state.currentProjectId = null;
      }
      saveToStorage(state.projects);
    },
    setCurrentProject: (state, action: PayloadAction<string | null>) => {
      state.currentProjectId = action.payload;
    },
    addTask: (state, action: PayloadAction<{projectId: string; task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>}>) => {
      const {projectId, task} = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        const newTask: Task = {
          ...task,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          projectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        project.tasks.push(newTask);
        project.updatedAt = new Date().toISOString();
        saveToStorage(state.projects);
      }
    },
    updateTask: (state, action: PayloadAction<{projectId: string; taskId: string; updates: Partial<Task>}>) => {
      const {projectId, taskId, updates} = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        const task = project.tasks.find(t => t.id === taskId);
        if (task) {
          Object.assign(task, updates, {updatedAt: new Date().toISOString()});
          project.updatedAt = new Date().toISOString();
          saveToStorage(state.projects);
        }
      }
    },
    moveTask: (state, action: PayloadAction<{projectId: string; taskId: string; newStatus: 'todo' | 'inProgress' | 'done'}>) => {
      const {projectId, taskId, newStatus} = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        const task = project.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = newStatus;
          task.updatedAt = new Date().toISOString();
          project.updatedAt = new Date().toISOString();
          saveToStorage(state.projects);
        }
      }
    },
    deleteTask: (state, action: PayloadAction<{projectId: string; taskId: string}>) => {
      const {projectId, taskId} = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project.tasks = project.tasks.filter(t => t.id !== taskId);
        project.updatedAt = new Date().toISOString();
        saveToStorage(state.projects);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setCurrentProject,
  addTask,
  updateTask,
  moveTask,
  deleteTask,
  setLoading,
} = projectsSlice.actions;

export default projectsSlice.reducer;

