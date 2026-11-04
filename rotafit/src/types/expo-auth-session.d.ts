declare module 'expo-auth-session/build/QueryParams' {
  export function getQueryParams(input: string): {
    errorCode: string | null;
    params: Record<string, string>;
  };
}
