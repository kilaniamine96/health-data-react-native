import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchDailyData, fetchWeeklyData, subscribeToDataTypes } from './thunks';
import { DailyData, WeeklyData } from '../types';

interface StepsState {
    daily: DailyData;
    weekly: WeeklyData;
    dataTimeType: DataTimeType;
    loading: boolean;
    error: StepsError | null;
}

export type StepsError =
    "PERMISSION_DENIED"
    | "PLAY_SERVICES_ERROR"
    | "NO_ACTIVITY"
    | "SUBSCRIBE_ERROR"
    | "DATA_READ_ERROR"
    | "PROCESSING_ERROR"
    | "UNKNOWN_ERROR"

type DataTimeType = "DAILY" | "WEEKLY"

const initialState: StepsState = {
    daily: {
        steps: 0,
        distance: 0,
        calories: 0,
    },
    weekly: {
        steps: [],
        distance: [],
        calories: [],
    },
    dataTimeType: 'DAILY',
    loading: false,
    error: null,
};

const stepsSlice = createSlice({
    name: 'steps',
    initialState,
    reducers: {
        setDataTimeType(state, action: PayloadAction<DataTimeType>) {
            state.dataTimeType = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDailyData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDailyData.fulfilled, (state, action: PayloadAction<DailyData>) => {
                state.daily = action.payload;
                state.loading = false;
            })
            .addCase(fetchDailyData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "UNKNOWN_ERROR";
            })
            .addCase(fetchWeeklyData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWeeklyData.fulfilled, (state, action: PayloadAction<WeeklyData>) => {
                state.weekly = action.payload;
                state.loading = false;
            })
            .addCase(fetchWeeklyData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "UNKNOWN_ERROR";
            })
            .addCase(subscribeToDataTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(subscribeToDataTypes.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(subscribeToDataTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "UNKNOWN_ERROR";
            });
    },
});

export const {setDataTimeType} = stepsSlice.actions;

export default stepsSlice.reducer;

