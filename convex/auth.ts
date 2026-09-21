import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { expo } from "@better-auth/expo";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);

// In development the Expo dev client identifies itself as exp://<LAN-IP>:<port> (your Metro
// address), which changes with the network/port. Only deployments that opt in via this env
// var trust those origins, so production keeps trusting the app scheme alone.
const devOrigins =
  process.env.AUTH_ALLOW_EXPO_DEV_ORIGINS === "true"
    ? [
        "exp://",
        "exp://**",
        "exp://192.168.*.*:*/**",
        "exp://10.*.*.*:*/**",
        "exp://172.*.*.*:*/**",
        "exp://localhost:*/**",
        "exp://127.0.0.1:*/**",
      ]
    : [];

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.CONVEX_SITE_URL,
    trustedOrigins: ["vibely://", ...devOrigins],
    // A failed callback (expired/used state, cancelled consent) returns to the app instead of a server error page
    onAPIError: { errorURL: "vibely://auth-error" },
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    plugins: [expo(), convex({ authConfig })],
  } satisfies BetterAuthOptions);
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
