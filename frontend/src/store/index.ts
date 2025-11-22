import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import warehousesReducer from './slices/warehousesSlice';
import inventoryReducer from './slices/inventorySlice';
import batchesReducer from './slices/batchesSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productsReducer,
        warehouses: warehousesReducer,
        inventory: inventoryReducer,
        batches: batchesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
