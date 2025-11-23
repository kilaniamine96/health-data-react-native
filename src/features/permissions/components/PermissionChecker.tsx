import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { useAppDispatch } from '@src/app/providers/hooks';
import { loadPermissionStatus, PermissionStatus, setInitializing, setPermissionStatus } from '../store/permissionSlice';

const { FitnessModule } = NativeModules;

const PermissionChecker = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializePermission = async () => {
      const savedStatus = await loadPermissionStatus();
      if (savedStatus !== 'unknown') {
        dispatch(setPermissionStatus(savedStatus));
        if (savedStatus === 'granted') {
          try {
            const hasPermission = await FitnessModule.checkPermission();
            const newStatus: PermissionStatus = hasPermission ? 'granted' : 'denied';
            if (newStatus !== savedStatus) {
              dispatch(setPermissionStatus(newStatus));
            }
          } catch (error) {
            console.log('Error checking permission:', error);
          }
        }
      }
      dispatch(setInitializing(false));
    };

    initializePermission();
  }, [dispatch]);

  return null;
};

export default PermissionChecker;

