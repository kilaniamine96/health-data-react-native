import {createAsyncThunk} from '@reduxjs/toolkit';
import {NativeModules} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PermissionStatus, PermissionError, PERMISSION_STATUS_KEY} from "./permissionSlice.ts";

const {FitnessModule} = NativeModules;

export const checkPermission = createAsyncThunk<
    PermissionStatus,
    void,
    { rejectValue: PermissionError }
>(
    'permission/checkPermission',
    async (_, {rejectWithValue}) => {
        try {
            const hasPermission = await FitnessModule.checkPermission();
            const status: PermissionStatus = hasPermission ? 'granted' : 'denied';
            await AsyncStorage.setItem(PERMISSION_STATUS_KEY, status);
            return status;
        } catch (e: unknown) {
            console.log(e);
            return rejectWithValue("UNKNOWN_ERROR");
        }
    }
);

export const requestFitnessPermission = createAsyncThunk<
    boolean,
    void,
    { rejectValue: PermissionError }
>(
    'permission/requestFitnessPermission',
    async (_, {rejectWithValue}) => {
        try {
            console.log('requestFitnessPermission');
            const granted = await FitnessModule.requestPermissions();
            console.log('granted', granted);
            if (!granted) {
                await AsyncStorage.setItem(PERMISSION_STATUS_KEY, 'denied');
                return rejectWithValue('PERMISSION_DENIED');
            }
            await AsyncStorage.setItem(PERMISSION_STATUS_KEY, 'granted');
            return true;
        } catch (e: unknown) {
            console.log(e);
            await AsyncStorage.setItem(PERMISSION_STATUS_KEY, 'denied');
            return rejectWithValue("UNKNOWN_ERROR");
        }
    }
);

