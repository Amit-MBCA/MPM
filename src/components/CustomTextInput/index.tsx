import React from 'react';
import {TextInput, TextInputProps, StyleSheet} from 'react-native';

interface CustomTextInputProps extends TextInputProps {}

const CustomTextInput: React.FC<CustomTextInputProps> = ({style, ...props}) => {
  return (
    <TextInput
      style={[styles.default, style]}
      allowFontScaling={false}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  default: {},
});

export default CustomTextInput;

