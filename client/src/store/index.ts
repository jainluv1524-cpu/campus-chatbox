import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Initialize state from localStorage
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

const preloadedState = {
  auth: {
    token: storedToken,
    isAuthenticated: !!storedToken,
    user: storedUser ? JSON.parse(storedUser) : null,
    status: 'idle',
    error: null,
  },
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Helper selector
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectToken = (state: RootState) => state.auth.token;