import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
}

interface InventoryState {
  lowStockAlerts: StockAlert[];
  expiringItems: any[];
  loading: boolean;
}

const initialState: InventoryState = {
  lowStockAlerts: [],
  expiringItems: [],
  loading: false,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setLowStockAlerts: (state, action: PayloadAction<StockAlert[]>) => {
      state.lowStockAlerts = action.payload;
    },
    setExpiringItems: (state, action: PayloadAction<any[]>) => {
      state.expiringItems = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setLowStockAlerts, setExpiringItems, setLoading } = inventorySlice.actions;
export default inventorySlice.reducer;
