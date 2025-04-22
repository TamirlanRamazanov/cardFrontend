import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import factionReducer from './slices/factionSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    faction: factionReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 