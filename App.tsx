import React, {useEffect, useState} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useDispatch} from 'react-redux';
import ProjectStack from './src/navigations/projectStack';
import {loadThemeFromStorage, initializeTheme} from './src/redux/slices/globalSlice';
import {setDispatch} from './src/helper/commonFunction';
import 'react-native-reanimated';
import { width } from './src/themes/spacing';
import { fontFamily } from './src/assets/fonts/fontFamily';
import { appImages } from './src/themes/appImages';
import CustomFlash from './src/components/CustomFlash';
import FlashMessage from 'react-native-flash-message';
import Loader from './src/components/Loader';
import SplashScreen from './src/components/SplashScreen';

function App() {
  const dispatch = useDispatch();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize dispatch for commonFunction
    setDispatch(dispatch);
    // Load theme from storage on app start
    loadThemeFromStorage().then(isDarkTheme => {
      dispatch(initializeTheme(isDarkTheme));
    });
  }, [dispatch]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <ProjectStack />
        <Loader />
              <FlashMessage
                statusBarHeight={StatusBar.currentHeight}
                position="top"
                titleStyle={styles.flashTitleStyle}
                textStyle={styles.flashTextStyle}
                style={styles.flashMessageStyle}
                MessageComponent={({ message }: any) => {
                  return (
                    <CustomFlash
                      msg={message.message}
                      img={
                        message.type == "red" ||
                        message.type == "error"
                          ? appImages.errorSign
                          : appImages.doneCheck
                      }
                    />
                  );
                }}
              />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flashTitleStyle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "left",
  },
  flashTextStyle: {
    fontSize: 18,
    fontFamily: fontFamily.regular,
    color: "#fff",
    textAlign: "left",
    zIndex: 999,
  },
  flashMessageStyle: {
    marginTop: width * 0.05,
  },
});

export default App;