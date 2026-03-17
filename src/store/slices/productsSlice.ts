import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  filters: {
    search: string;
    category: string;
  };
}

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  loading: false,
  filters: {
    search: '',
    category: '',
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setProducts, setSelectedProduct, setLoading, setFilters } = productsSlice.actions;
export default productsSlice.reducer;
