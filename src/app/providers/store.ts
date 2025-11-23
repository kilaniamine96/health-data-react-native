import { configureStore } from '@reduxjs/toolkit';
import stepsReducer from '../../features/steps/store/stepsSlice';
import permissionReducer from '../../features/permissions/store/permissionSlice';

export const store = configureStore({
  reducer: {
    steps: stepsReducer,
    permission: permissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

