import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@src/app/providers/store';

export const selectDailyData = (state: RootState) => state.steps.daily;
export const selectWeeklyData = (state: RootState) => state.steps.weekly;
export const selectDataTimeType = (state: RootState) => state.steps.dataTimeType;

export const selectStatsData = createSelector(
  [selectDataTimeType, selectDailyData, selectWeeklyData],
  (dataTimeType, daily, weekly) => {
    if (dataTimeType === 'DAILY') {
      return {
        totalSteps: daily.steps,
        totalDistance: daily.distance,
        totalCalories: daily.calories,
      };
    } else {
      return {
        totalSteps: weekly.steps.reduce((a, b) => a + b, 0),
        totalDistance: weekly.distance.reduce((a, b) => a + b, 0),
        totalCalories: weekly.calories.reduce((a, b) => a + b, 0),
      };
    }
  }
);

