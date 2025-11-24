import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { getProfile } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import WarehousesPage from './pages/WarehousesPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import BatchesPage from './pages/BatchesPage';
import GoodsReceiptPage from './pages/GoodsReceiptPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const dispatch = useAppDispatch();
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (token && !isAuthenticated) {
            dispatch(getProfile());
        }
    }, [dispatch, token, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <>
            <ToastContainer />
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/warehouses" element={<WarehousesPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/batches" element={<BatchesPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/goods-receipt" element={<GoodsReceiptPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Layout>
        </>
    );
}

export default App;
