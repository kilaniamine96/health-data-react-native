import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity, Linking, AppState, AppStateStatus } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch } from '@src/app/providers/hooks';
import { checkPermission } from '../store/permissionThunks';
import { subscribeToDataTypes } from '../../steps/store/thunks';
import { theme } from '@src/shared/theme/theme';

const DeniedScreen = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        try {
          const result = await dispatch(checkPermission()).unwrap();
          if (result === 'granted') {
            await dispatch(subscribeToDataTypes()).unwrap();
          }
        } catch (error) {
          console.log('Error checking permission or subscribing:', error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Dommage :(</Text>
        <Text style={styles.description}>
          Vous avez refusé l'accès aux données d'activité. Sans cette permission, nous ne pouvons pas suivre vos pas quotidiens.
        </Text>
        <Text style={styles.description}>
          Vous pouvez réactiver cette permission plus tard dans les réglages de l'application.
        </Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleOpenSettings}
          activeOpacity={0.8}
        >
          <Text style={styles.settingsButtonText}>Aller aux réglages</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    ...(theme.textVariants.header as TextStyle),
    color: theme.colors.white,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  description: {
    ...theme.textVariants.body,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    lineHeight: 24,
    opacity: 0.9,
  },
  settingsButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 8,
    marginTop: theme.spacing.l,
    width: '100%',
    alignItems: 'center',
  },
  settingsButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeniedScreen;

