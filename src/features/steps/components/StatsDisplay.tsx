import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@src/shared/theme/theme';

interface StatsDisplayProps {
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
}

const renderStat = (value: string | number, unit: string, label: string) => {
  return (
    <View style={styles.statItem}>
      <View style={styles.statValueContainer}>
        <Text style={styles.statValue}>
          {value}
        </Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  totalSteps,
  totalDistance,
  totalCalories,
}) => {
  const displayDistance = totalDistance >= 1000
    ? (totalDistance / 1000).toFixed(2)
    : totalDistance.toFixed(2);
  const distanceUnit = totalDistance >= 1000 ? 'km' : 'm';

  return (
    <View>
      <Text style={styles.stepsValue}>{totalSteps.toLocaleString()}</Text>
      <Text style={styles.stepsLabel}>Steps</Text>
      <View style={styles.statsRow}>
        {renderStat(displayDistance, distanceUnit, 'Distance')}
        {renderStat(Math.round(totalCalories), 'kcal', 'Calories')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepsValue: {
    fontSize: 75,
    fontWeight: 'bold',
    lineHeight: 60,
    color: theme.colors.white,
  },
  stepsLabel: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.l,
  },
  statsRow: {
    flexDirection: 'row'
  },
  statItem: {
    flex: 1
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 30,
    lineHeight: 28,
    fontWeight: '700',
    color: theme.colors.white,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
    marginStart: 2,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.white,
  },
});

export default StatsDisplay;

