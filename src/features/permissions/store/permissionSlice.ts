import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { checkPermission, requestFitnessPermission } from './permissionThunks';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PermissionStatus = 'unknown' | 'granted' | 'denied';

export type PermissionError =
    "PERMISSION_DENIED"
    | "PLAY_SERVICES_ERROR"
    | "NO_ACTIVITY"
    | "UNKNOWN_ERROR"

interface PermissionState {
    permissionStatus: PermissionStatus;
    loading: boolean;
    error: PermissionError | null;
    isInitializing: boolean;
}

const initialState: PermissionState = {
    permissionStatus: 'unknown',
    loading: false,
    error: null,
    isInitializing: true,
};

export const PERMISSION_STATUS_KEY = '@HealthData:permissionStatus';

const permissionSlice = createSlice({
    name: 'permission',
    initialState,
    reducers: {
        setPermissionStatus(state, action: PayloadAction<PermissionStatus>) {
            state.permissionStatus = action.payload;
        },
        setInitializing(state, action: PayloadAction<boolean>) {
            state.isInitializing = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkPermission.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkPermission.fulfilled, (state, action: PayloadAction<PermissionStatus>) => {
                state.loading = false;
                state.permissionStatus = action.payload;
            })
            .addCase(checkPermission.rejected, (state) => {
                state.loading = false;
                // Keep actual error state
            })
            .addCase(requestFitnessPermission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestFitnessPermission.fulfilled, (state) => {
                state.loading = false;
                state.permissionStatus = 'granted';
                state.error = null;
            })
            .addCase(requestFitnessPermission.rejected, (state, action) => {
                state.loading = false;
                state.permissionStatus = 'denied';
                state.error = action.payload ?? "UNKNOWN_ERROR";
            });
    },
});

export const {setPermissionStatus, setInitializing} = permissionSlice.actions;

export const loadPermissionStatus = async (): Promise<PermissionStatus> => {
    try {
        const status = await AsyncStorage.getItem(PERMISSION_STATUS_KEY);
        if (status && (status === 'granted' || status === 'denied' || status === 'unknown')) {
            return status as PermissionStatus;
        }
    } catch (error) {
        console.log('Error loading permission status:', error);
    }
    return 'unknown';
};

export default permissionSlice.reducer;

