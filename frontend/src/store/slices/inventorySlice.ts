import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface StockLevel {
    id: string;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    product: any;
    warehouse: any;
}

interface InventoryState {
    stockLevels: StockLevel[];
    loading: boolean;
    error: string | null;
}

const initialState: InventoryState = {
    stockLevels: [],
    loading: false,
    error: null,
};

export const fetchStockLevels = createAsyncThunk(
    'inventory/fetchStockLevels',
    async (_, { getState }) => {
        const state = getState() as any;
        const response = await axios.get(`${API_URL}/inventory/stock-levels`, {
            headers: { Authorization: `Bearer ${state.auth.token}` },
        });
        return response.data;
    }
);

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStockLevels.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStockLevels.fulfilled, (state, action) => {
                state.loading = false;
                state.stockLevels = action.payload;
            })
            .addCase(fetchStockLevels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch stock levels';
            });
    },
});

export default inventorySlice.reducer;
