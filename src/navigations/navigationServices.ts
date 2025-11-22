import * as React from 'react';
import {CommonActions} from '@react-navigation/native';
export const navigationRef: any = React.createRef();

let navigator: any;

export const navigate = (path: string, params?: object) => {
  navigationRef.current.navigate(path, params);
};

export const goBack = () => {
  navigationRef.current.goBack();
};

export const reset = (name: string, index: number) => {
  navigationRef.current.dispatch(
    CommonActions.reset({
      index: index,
      routes: [
        {
          name: name,
        },
      ],
    }),
  );
};

export const setNavigator = (nav: any) => {
  navigator = nav;
};

export const getCurrentRoute = () => {
  const route = navigationRef?.current.getCurrentRoute();
  return route.name;
};

export const getParent = () => {
  const parentNavigator = navigationRef?.current?.getParent();
  return parentNavigator;
};