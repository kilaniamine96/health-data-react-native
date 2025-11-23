import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/app/providers/store';
import RootNavigator from './src/app/navigation/RootNavigator';
import PermissionChecker from './src/features/permissions/components/PermissionChecker';

const App = () => {
  return (
    <Provider store={store}>
      <PermissionChecker />
      <RootNavigator />
    </Provider>
  );
};

export default App;
