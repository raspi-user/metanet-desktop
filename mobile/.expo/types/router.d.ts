/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/dashboard` | `/(tabs)/phone` | `/_app` | `/_sitemap` | `/dashboard` | `/phone` | `/recovery`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
