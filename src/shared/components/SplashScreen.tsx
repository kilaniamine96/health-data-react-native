import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme/theme';

const SplashScreen = () => {
  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/wardy.png')} 
          style={styles.image}
          resizeMode="contain"
        />
        <ActivityIndicator 
          size="large" 
          color={theme.colors.white} 
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 260,
    height: 260,
    marginBottom: theme.spacing.l,
  },
  loader: {
    marginTop: theme.spacing.l,
  },
});

export default SplashScreen;

