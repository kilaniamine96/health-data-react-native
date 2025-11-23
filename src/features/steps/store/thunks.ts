import { createAsyncThunk } from '@reduxjs/toolkit';
import { NativeModules } from 'react-native';
import { DailyData, WeeklyData } from '../types';
import { StepsError } from "./stepsSlice.ts";

const {FitnessModule} = NativeModules;

export const subscribeToDataTypes = createAsyncThunk<
    boolean,
    void,
    { rejectValue: StepsError }
>(
    'steps/subscribeToDataTypes',
    async (_, {rejectWithValue}) => {
        try {
            return await FitnessModule.subscribeToDataTypes();
        } catch (e: any) {
            console.log('Error subscribing to data types:', e);
            return rejectWithValue(e?.code ?? "UNKNOWN_ERROR");
        }
    }
);

export const fetchDailyData = createAsyncThunk<DailyData, void, { rejectValue: StepsError }>(
    'steps/fetchDailyData',
    async (_: void, {rejectWithValue}) => {
        try {
            return await FitnessModule.getTodaysSteps();
        } catch (e: any) {
            console.log(e?.message)
            return rejectWithValue(e?.code ?? 'UNKNOWN_ERROR');
        }
    }
);

export const fetchWeeklyData = createAsyncThunk<WeeklyData, void, { rejectValue: StepsError }>(
    'steps/fetchWeeklyData',
    async (_: void, {rejectWithValue}) => {
        try {
            return await FitnessModule.getWeeklySteps();
        } catch (e: any) {
            console.log(e?.message);
            return rejectWithValue(e?.code ?? 'UNKNOWN_ERROR');
        }
    }
);

