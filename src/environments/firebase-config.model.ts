export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export function isFirebaseConfigured(config?: FirebaseWebConfig | null): boolean {
  if (!config) return false;
  return Boolean(
    config.apiKey &&
      !config.apiKey.startsWith('TU_') &&
      config.authDomain &&
      !config.authDomain.startsWith('TU_') &&
      config.projectId &&
      !config.projectId.startsWith('TU_') &&
      config.appId &&
      !config.appId.startsWith('TU_')
  );
}
