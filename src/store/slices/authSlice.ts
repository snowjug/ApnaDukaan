import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
      state.loading = false;
    },
    setRole: (state, action: PayloadAction<string | null>) => {
      state.role = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.session = null;
      state.role = null;
      state.loading = false;
    },
  },
});

export const { setUser, setSession, setRole, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
