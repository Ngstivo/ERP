import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface GoodsReceipt {
    id: string;
    receiptNumber: string;
    purchaseOrder: any;
    warehouse: any;
    receiptDate: Date;
    status: string;
    items: any[];
}

interface GoodsReceiptState {
    receipts: GoodsReceipt[];
    loading: boolean;
    error: string | null;
}

const initialState: GoodsReceiptState = {
    receipts: [],
    loading: false,
    error: null,
};

export const fetchGoodsReceipts = createAsyncThunk(
    'goodsReceipt/fetchAll',
    async (_, { getState }) => {
        const state = getState() as any;
        const response = await axios.get(`${API_URL}/goods-receipt`, {
            headers: { Authorization: `Bearer ${state.auth.token}` },
        });
        return response.data;
    }
);

const goodsReceiptSlice = createSlice({
    name: 'goodsReceipt',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGoodsReceipts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGoodsReceipts.fulfilled, (state, action) => {
                state.loading = false;
                state.receipts = action.payload;
            })
            .addCase(fetchGoodsReceipts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch goods receipts';
            });
    },
});

export default goodsReceiptSlice.reducer;
