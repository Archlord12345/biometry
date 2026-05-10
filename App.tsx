import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LockScreen from './src/components/LockScreen';
import HomeScreen from './src/components/HomeScreen';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
      {isLocked ? (
        <LockScreen onUnlock={() => setIsLocked(false)} />
      ) : (
        <HomeScreen onLock={() => setIsLocked(true)} />
      )}
    </SafeAreaProvider>
  );
}