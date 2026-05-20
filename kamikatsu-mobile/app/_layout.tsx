import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { generateSessionId } from '@/lib/utils';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const setSessionId = useAppStore((state) => state.setSessionId);

  useEffect(() => {
    setSessionId(generateSessionId());
  }, [setSessionId]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="product/[id]"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="category/[code]"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
