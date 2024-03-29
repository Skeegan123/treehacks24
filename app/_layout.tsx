import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useEffect, useState } from "react";

import { useColorScheme } from "@/components/useColorScheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

export const AsyncStorageContext = createContext({
  didAsyncStorageUpdate: false,
  setDidAsyncStorageUpdate: (_: boolean) => {},
});

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const [didAsyncStorageUpdate, setDidAsyncStorageUpdate] = useState(false);

  return (
    <AsyncStorageContext.Provider
      value={{ didAsyncStorageUpdate, setDidAsyncStorageUpdate }}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ presentation: "modal" }} />
          <Stack.Screen name="signup" options={{ presentation: "modal" }} />
          <Stack.Screen name="create" options={{ headerShown: false }} />
          <Stack.Screen name="personal" options={{ headerShown: false }} />
          <Stack.Screen name="memory/[id]" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AsyncStorageContext.Provider>
  );
}
