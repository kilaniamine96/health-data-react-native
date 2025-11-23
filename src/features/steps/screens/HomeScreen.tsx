import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { setDataTimeType } from '../store/stepsSlice';
import { theme } from '@src/shared/theme/theme';
import { useAppDispatch, useAppSelector } from '@src/app/providers/hooks';
import { selectDataTimeType, selectStatsData } from '../store/selectors';
import { fetchDailyData, fetchWeeklyData } from '../store/thunks';
import ToggleSwitch from '../components/ToggleSwitch';
import Loading from '../../../shared/components/Loading';
import Error from '../../../shared/components/Error';
import StatsDisplay from '../components/StatsDisplay';

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectDataTimeType);
  const statsData = useAppSelector(selectStatsData);
  const loading = useAppSelector((state) => state.steps.loading);
  const error = useAppSelector((state) => state.steps.error);
  const selectedIndex = view === 'DAILY' ? 0 : 1;

  useEffect(() => {
    dispatch(fetchDailyData());
    dispatch(fetchWeeklyData());
  }, [dispatch]);

  const handleToggleSelect = (index: number) => {
    dispatch(setDataTimeType(index === 0 ? 'DAILY' : 'WEEKLY'));
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.topSection}>
        <Image source={require('@src/assets/images/wardy.png')} style={{width: 260, height: 260}} />
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image source={require('@src/assets/images/logo.png')} style={{width: 32, height: 32}} resizeMode='contain' />
          <View style={styles.toggleContainer}>
            <ToggleSwitch
              options={['D', 'W']}
              selectedIndex={selectedIndex}
              onSelect={handleToggleSelect}
            />
          </View>
        </View>
        <StatsDisplay {...statsData} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 30,
    marginHorizontal: theme.spacing.s,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  toggleContainer: {
    alignItems: 'center',
  },
});

export default HomeScreen;

