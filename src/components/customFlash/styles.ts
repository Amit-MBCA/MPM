import {StyleSheet, ViewStyle, TextStyle, ImageStyle} from 'react-native';
import {width} from '../../themes/spacing';
import fontSizes from '../../themes/fontSizes';
import {fontFamily} from '../../assets/fonts/fontFamily';

interface Theme {
  cardBg: string;
  borderColor: string;
  isDarkTheme: boolean;
  textPrimary: string;
  textTertiary: string;
}

interface Styles {
  container: ViewStyle;
  imgStyle: ImageStyle;
  msgTxt: TextStyle;
  descTxt: TextStyle;
  txtStyle: ViewStyle;
}

export const getStyles = (theme: Theme): Styles =>
  StyleSheet.create({
    container: {
      alignSelf: 'center',
      backgroundColor: theme.cardBg,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginTop: width * 0.15,
      borderWidth: 0.5,
      borderColor: theme.borderColor,
      shadowOffset: {
        x: 0,
        y: 20,
      },
      shadowColor: theme.isDarkTheme ? '#000' : '#666',
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 5,
    },
    imgStyle: {
      width: width * 0.06,
      height: width * 0.06,
    },
    msgTxt: {
      fontSize: fontSizes.f16,
      fontFamily: fontFamily.bold,
      color: theme.textPrimary,
      flexWrap: 'wrap',
    },
    descTxt: {
      fontSize: fontSizes.f14,
      fontFamily: fontFamily.regular,
      color: theme.textTertiary,
    },
    txtStyle: {
      maxWidth: width * 0.6,
    },
  });

