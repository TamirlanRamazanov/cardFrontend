import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, User } from '../../services/AuthService';
import { RootState } from '../index';

// Типы для состояния
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: AuthState = {
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

// Async thunks для асинхронных операций
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await authService.login(email, password);
      if (!user) {
        return rejectWithValue(authService.getError() || 'Ошибка входа');
      }
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка входа');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const user = await authService.register(name, email, password);
      if (!user) {
        return rejectWithValue(authService.getError() || 'Ошибка регистрации');
      }
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка регистрации');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return null;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Ошибка выхода из системы');
  }
});

// Создание slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateAuthState: (state, action: PayloadAction<{ user: User | null; isAuthenticated: boolean }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Экспорт actions
export const { logout, clearError, updateAuthState } = authSlice.actions;

// Селекторы
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer; 