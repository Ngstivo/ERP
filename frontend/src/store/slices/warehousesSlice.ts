import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Warehouse {
    id: string;
    code: string;
    name: string;
    address: string;
    city?: string;
    country?: string;
}

interface WarehousesState {
    warehouses: Warehouse[];
    loading: boolean;
    error: string | null;
}

const initialState: WarehousesState = {
    warehouses: [],
    loading: false,
    error: null,
};

export const fetchWarehouses = createAsyncThunk(
    'warehouses/fetchAll',
    async (_, { getState }) => {
        const state = getState() as any;
        const response = await axios.get(`${API_URL}/warehouses`, {
            headers: { Authorization: `Bearer ${state.auth.token}` },
        });
        return response.data;
    }
);

const warehousesSlice = createSlice({
    name: 'warehouses',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWarehouses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWarehouses.fulfilled, (state, action) => {
                state.loading = false;
                state.warehouses = action.payload;
            })
            .addCase(fetchWarehouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch warehouses';
            });
    },
});

export default warehousesSlice.reducer;
