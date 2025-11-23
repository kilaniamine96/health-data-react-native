import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '@src/app/providers/hooks';
import { requestFitnessPermission } from '../store/permissionThunks';
import { PermissionError } from '../store/permissionSlice';
import { theme } from '@src/shared/theme/theme';
import Loading from '@src/shared/components/Loading';

const OnboardingScreen = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.permission.loading);
  const error = useAppSelector((state) => state.permission.error);

  const handleRequestPermission = () => {
    dispatch(requestFitnessPermission());
  };

  const getErrorMessage = (errorCode: PermissionError | null): string => {
    switch (errorCode) {
      case 'PERMISSION_DENIED':
        return 'Permission refusée. Vous pourrez la réactiver plus tard dans les réglages.';
      case 'PLAY_SERVICES_ERROR':
        return 'Erreur Google Play Services. Vérifiez que les services sont à jour.';
      case 'NO_ACTIVITY':
        return 'Aucune activité détectée pour la demande de permission.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue dans Health Data</Text>
        <Text style={styles.description}>
          Pour calculer vos pas quotidiens et suivre votre activité physique, nous avons besoin d'accéder à vos données d'activité.
        </Text>
        <Text style={styles.description}>
          Ces données restent privées et sont uniquement utilisées pour vous afficher vos statistiques.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRequestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Autoriser l'accès</Text>
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
  errorContainer: {
    backgroundColor: theme.colors.errorBackground,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    padding: theme.spacing.m,
    borderRadius: 8,
    marginBottom: theme.spacing.l,
    width: '100%',
  },
  errorText: {
    color: theme.colors.errorText,
    textAlign: 'center',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 8,
    marginTop: theme.spacing.l,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;

