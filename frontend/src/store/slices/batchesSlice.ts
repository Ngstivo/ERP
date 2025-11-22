import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Batch {
    id: string;
    batchNumber: string;
    lotNumber?: string;
    product: any;
    warehouse: any;
    manufacturingDate?: Date;
    expirationDate?: Date;
    qualityStatus: string;
    initialQuantity: number;
    currentQuantity: number;
}

interface BatchesState {
    batches: Batch[];
    loading: boolean;
    error: string | null;
}

const initialState: BatchesState = {
    batches: [],
    loading: false,
    error: null,
};

export const fetchBatches = createAsyncThunk(
    'batches/fetchAll',
    async (_, { getState }) => {
        const state = getState() as any;
        const response = await axios.get(`${API_URL}/batches`, {
            headers: { Authorization: `Bearer ${state.auth.token}` },
        });
        return response.data;
    }
);

export const fetchExpiringBatches = createAsyncThunk(
    'batches/fetchExpiring',
    async (days: number, { getState }) => {
        const state = getState() as any;
        const response = await axios.get(`${API_URL}/batches/expiring?days=${days}`, {
            headers: { Authorization: `Bearer ${state.auth.token}` },
        });
        return response.data;
    }
);

const batchesSlice = createSlice({
    name: 'batches',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBatches.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBatches.fulfilled, (state, action) => {
                state.loading = false;
                state.batches = action.payload;
            })
            .addCase(fetchBatches.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch batches';
            })
            .addCase(fetchExpiringBatches.fulfilled, (state, action) => {
                state.batches = action.payload;
            });
    },
});

export default batchesSlice.reducer;
