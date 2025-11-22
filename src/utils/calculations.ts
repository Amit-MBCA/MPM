import {Project, Task} from '../redux/slices/projectsSlice';

/**
 * Calculate completion percentage based on tasks status
 */
export const calculateCompletionPercentage = (project: Project): number => {
  if (!project.tasks || project.tasks.length === 0) {
    return 0;
  }
  
  const doneTasks = project.tasks.filter(task => task.status === 'done').length;
  return Math.round((doneTasks / project.tasks.length) * 100);
};

/**
 * Get total tasks count
 */
export const getTotalTasks = (project: Project): number => {
  return project.tasks?.length || 0;
};

/**
 * Get tasks by status
 */
export const getTasksByStatus = (
  tasks: Task[],
  status: 'todo' | 'inProgress' | 'done',
): Task[] => {
  return tasks.filter(task => task.status === status);
};

