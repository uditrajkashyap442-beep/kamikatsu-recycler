import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { generateSessionId } from '@/lib/utils';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const setSessionId = useAppStore((state) => state.setSessionId);
  const { hasOnboarded, user } = useAppStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setSessionId(generateSessionId());
  }, [setSessionId]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    // Slight delay to allow layout to mount
    setTimeout(() => {
      if (!hasOnboarded) {
        if (segments[1] !== 'onboarding') {
          router.replace('/(auth)/onboarding');
        }
      } else if (!user) {
        if (!inAuthGroup) {
          router.replace('/(auth)/login');
        }
      } else if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 100);
  }, [hasOnboarded, user, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
