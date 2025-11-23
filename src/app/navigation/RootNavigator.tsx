import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../features/steps/screens/HomeScreen';
import OnboardingScreen from '../../features/permissions/screens/OnboardingScreen';
import DeniedScreen from '../../features/permissions/screens/DeniedScreen';
import { Routes } from "./Routes.ts";
import { useAppSelector } from '../providers/hooks';
import { selectPermissionStatus } from '../../features/permissions/store/permissionSelectors';
import SplashScreen from '../../shared/components/SplashScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const permissionStatus = useAppSelector(selectPermissionStatus);
  const isInitializing = useAppSelector((state) => state.permission.isInitializing);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    if (navigationRef.current && !isInitializing && permissionStatus !== 'unknown') {
      if (permissionStatus === 'granted') {
        navigationRef.current?.navigate(Routes.Home);
      } else if (permissionStatus === 'denied') {
        navigationRef.current?.navigate(Routes.Denied);
      }
    }
  }, [permissionStatus, isInitializing]);

  if (isInitializing) {
    return <SplashScreen />;
  }

  const getInitialRoute = () => {
    if (permissionStatus === 'granted') {
      return Routes.Home;
    } else if (permissionStatus === 'denied') {
      return Routes.Denied;
    } else {
      return Routes.Onboarding;
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRoute()}
      >
        <Stack.Screen name={Routes.Onboarding} component={OnboardingScreen} />
        <Stack.Screen name={Routes.Home} component={HomeScreen} />
        <Stack.Screen name={Routes.Denied} component={DeniedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

