import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from '@reduxjs/toolkit';
import globalReducer from './globalSlice';
import persistReducer from 'redux-persist/es/persistReducer';
import projectsReducer from './projectsSlice';


const globalPersistConfig = {
  key: 'global',
  storage: AsyncStorage,
  whitelist: ['isDarkTheme'], // Only persist theme preference
};
const persistedGlobalReducer = persistReducer(globalPersistConfig, globalReducer);

export const rootReducer = combineReducers({
  global: persistedGlobalReducer,
  projects: projectsReducer,
});
