import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProjectListScreen from '../screens/mainStack/ProjectList';
import KanbanBoardScreen from '../screens/mainStack/KanbanBoard';
import TaskDetailsScreen from '../screens/mainStack/TaskDetails';

const Stack = createNativeStackNavigator();

const ProjectStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProjectList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}>
      <Stack.Screen name="ProjectList" component={ProjectListScreen} />
      <Stack.Screen name="KanbanBoard" component={KanbanBoardScreen} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
    </Stack.Navigator>
  );
};

export default ProjectStack;

