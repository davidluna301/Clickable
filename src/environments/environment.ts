import { FirebaseWebConfig } from './firebase-config.model';

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: 'AIzaSyCjSBhHJSqYRnQ70GYSaul7BK67X1I_dEw',
    authDomain: 'buzonucc.firebaseapp.com',
    projectId: 'buzonucc',
    storageBucket: 'buzonucc.firebasestorage.app',
    messagingSenderId: '754442098563',
    appId: '1:754442098563:web:3e1fa64d3f9e11222488b6',
    measurementId: 'G-8KTVBQ3SQT',
  } satisfies FirebaseWebConfig,
};
