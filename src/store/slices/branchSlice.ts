import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
}

interface BranchState {
  branches: Branch[];
  currentBranchId: string | null;
  loading: boolean;
}

const initialState: BranchState = {
  branches: [],
  currentBranchId: null,
  loading: false,
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setBranches: (state, action: PayloadAction<Branch[]>) => {
      state.branches = action.payload;
    },
    setCurrentBranch: (state, action: PayloadAction<string>) => {
      state.currentBranchId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setBranches, setCurrentBranch, setLoading } = branchSlice.actions;
export default branchSlice.reducer;
