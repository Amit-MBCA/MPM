import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@app_theme';

const initialState = {
  isLoading: false,
  isDarkTheme: true, // Default to dark theme
};

export const loadThemeFromStorage = async () => {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
  } catch (error) {
  }
  return initialState.isDarkTheme;
};

export const saveThemeToStorage = async (isDarkTheme) => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDarkTheme));
  } catch (error) {
  }
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    loadingOn: (state, action) => {
      state.isLoading = true;
    },
    loadingOff: state => {
      state.isLoading = false;
    },
    toggleTheme: state => {
      state.isDarkTheme = !state.isDarkTheme;
      saveThemeToStorage(state.isDarkTheme);
    },
    setTheme: (state, action) => {
      state.isDarkTheme = action.payload;
      saveThemeToStorage(action.payload);
    },
    initializeTheme: (state, action) => {
      state.isDarkTheme = action.payload;
    },
    resetGlobalStore: () => {
      return initialState;
    },
  },
});

export const {loadingOn, loadingOff, toggleTheme, setTheme, initializeTheme, resetGlobalStore} = globalSlice.actions;
export default globalSlice.reducer;
