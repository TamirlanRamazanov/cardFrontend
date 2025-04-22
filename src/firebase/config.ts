import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Конфигурация Firebase
// Замените следующие значения на свои настройки Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDRkDg5kfUUJ7wNDFAW62HhFcHeihn_PGQ",
    authDomain: "cards-endterm-project.firebaseapp.com",
    projectId: "cards-endterm-project",
    storageBucket: "cards-endterm-project.firebasestorage.app",
    messagingSenderId: "763023811110",
    appId: "1:763023811110:web:769d1ca5eae783d56d7ce7",
    measurementId: "G-LD3W84G3M3"
  };

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт сервисов Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app; 