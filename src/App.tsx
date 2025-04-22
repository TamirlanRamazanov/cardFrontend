import React, { useEffect } from 'react';
import './App.css';
import AppRouter from './components/AppRouter';
import { useAppDispatch } from './store/hooks';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { updateAuthState } from './store/slices/authSlice';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Получаем дополнительную информацию о пользователе из Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          let userData = { name: 'Пользователь' };
          if (userDoc.exists()) {
            userData = userDoc.data() as { name: string };
          }
          
          // Обновляем состояние Redux
          dispatch(updateAuthState({
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name
            },
            isAuthenticated: true
          }));
        } catch (error) {
          console.error('Error syncing auth state:', error);
        }
      } else {
        // Пользователь вышел, обновляем состояние
        dispatch(updateAuthState({ user: null, isAuthenticated: false }));
      }
    });

    // Отписываемся при размонтировании
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <AppRouter />
  );
}

export default App;