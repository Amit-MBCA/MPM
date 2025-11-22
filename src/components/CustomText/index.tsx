import React from 'react';
import {Text, TextProps} from 'react-native';

interface CustomTextProps extends TextProps {
  children?: React.ReactNode;
}

const CustomText: React.FC<CustomTextProps> = ({children, ...props}) => {
  return (
    <Text allowFontScaling={false} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;

