import { RootState } from '../../../app/providers/store';

export const selectPermissionStatus = (state: RootState) => state.permission.permissionStatus;

