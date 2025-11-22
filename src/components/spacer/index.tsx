import React from 'react';
import {View, ViewStyle} from 'react-native';

interface SpacerProps {
  height?: number;
  width?: number | string;
  background?: string;
  flex?: number;
}

const Spacer: React.FC<SpacerProps> = ({
  height = 10,
  width = '100%',
  background,
  flex,
}) => {
  const style: ViewStyle = {
    height: height,
    width: width,
    backgroundColor: background,
    flex: flex,
  };

  return <View style={style} />;
};

export default Spacer;

