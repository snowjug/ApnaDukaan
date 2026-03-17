import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import productsReducer from './slices/productsSlice';
import inventoryReducer from './slices/inventorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    products: productsReducer,
    inventory: inventoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setSession'],
        ignoredPaths: ['auth.session'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
