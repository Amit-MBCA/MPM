import {useSelector} from 'react-redux';
import {darkTheme, lightTheme} from '../themes/colors';

export const useTheme = () => {
  const isDarkTheme = useSelector((state: any) => state.global.isDarkTheme);
  const theme = isDarkTheme ? darkTheme : lightTheme;
  
  const themeWithMode = {
    ...theme,
    isDarkTheme,
  };
  
  return {
    theme: themeWithMode,
    isDarkTheme,
    colors: themeWithMode,
  };
};

