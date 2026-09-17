import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    expoClient({
      scheme: (Constants.expoConfig?.scheme as string) ?? "vibely",
      storagePrefix: (Constants.expoConfig?.scheme as string) ?? "vibely",
      storage: SecureStore,
    }),
    convexClient(),
  ],
});
