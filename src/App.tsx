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
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          let userData = { name: 'Пользователь' };
          if (userDoc.exists()) {
            userData = userDoc.data() as { name: string };
          }
          

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
        dispatch(updateAuthState({ user: null, isAuthenticated: false }));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <AppRouter />
  );
}

export default App;