import React from 'react';
import {ActivityIndicator, StyleSheet, View, ViewStyle} from 'react-native';
import {useSelector} from 'react-redux';
import {height, width} from '../../themes/spacing';
import {useTheme} from '../../hooks/useTheme';

interface RootState {
  global: {
    isLoading: boolean;
  };
}

const Loader: React.FC = () => {
  const {isLoading} = useSelector((state: RootState) => state.global);
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    modalBackground: {
      width: width,
      height: height,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'absolute',
      backgroundColor: theme.isDarkTheme
        ? 'rgba(0, 0, 0, 0.6)'
        : 'rgba(255, 255, 255, 0.7)',
      zIndex: 9999,
      elevation: 10,
    },
    activityIndicatorWrapper: {
      height: 100,
      width: 100,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBg,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });

  if (!isLoading) {
    return null;
  }

  return (
    <View style={styles.modalBackground}>
      <View style={styles.activityIndicatorWrapper}>
        <ActivityIndicator
          color={theme.primaryColor}
          size={'large'}
          animating={true}
        />
      </View>
    </View>
  );
};

export default Loader;

