import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { Navigator } from './src/navigation/Navigator';

LogBox.ignoreLogs(['"shadow*" style props are deprecated']);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Navigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
