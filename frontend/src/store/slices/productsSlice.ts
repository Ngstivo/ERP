import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    unitPrice: number;
    costPrice: number;
    reorderPoint: number;
    category?: any;
    unitOfMeasure?: any;
    stockLevels?: any[];
}

interface ProductsState {
    products: Product[];
    loading: boolean;
    error: string | null;
}

const initialState: ProductsState = {
    products: [],
    loading: false,
    error: null,
};

export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (_, { getState }) => {
        const state = getState() as any;
        const response = await axios.get(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${state.auth.token}` },
        });
        return response.data;
    }
);

export const createProduct = createAsyncThunk(
    'products/create',
    async (productData: Partial<Product>, { getState }) => {
        const state = getState() as any;
        const response = await axios.post(`${API_URL}/products`, productData, {
            headers: { Authorization: `Bearer ${state.auth.token}` },
        });
        return response.data;
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch products';
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
            });
    },
});

export default productsSlice.reducer;
