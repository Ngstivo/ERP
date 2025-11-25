import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useAppSelector } from '../hooks/redux';
import OrderDialog from '../components/orders/OrderDialog';
import { format } from 'date-fns';
import { API_URL } from '../config/api';
import { showSuccess, showError, showWarning } from '../utils/toast';

export default function OrdersPage() {
    const { token } = useAppSelector((state) => state.auth);
    const [orders, setOrders] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL}/orders/purchase`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const handleCloseDialog = () => {
        setOpenDialog(false);
        fetchOrders();
    };

    const handleDelete = async (id: string, orderNumber: string) => {
        if (!window.confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
            return;
        }
        try {
            await axios.delete(`${API_URL}/orders/purchase/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchOrders();
            showSuccess('Order deleted successfully!');
        } catch (error) {
            showError(error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight={600}>
                        Purchase Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage purchase orders
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                    Create Order
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order #</TableCell>
                                    <TableCell>Warehouse</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Items</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                                No orders found. Click "Create Order" to start.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order) => (
                                        <TableRow key={order.id} hover>
                                            <TableCell>{order.orderNumber}</TableCell>
                                            <TableCell>{order.warehouse?.name || '-'}</TableCell>
                                            <TableCell>
                                                {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell align="right">{order.items?.length || 0}</TableCell>
                                            <TableCell>
                                                <Chip label={order.status || 'DRAFT'} size="small" />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(order.id, order.orderNumber)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <OrderDialog open={openDialog} onClose={handleCloseDialog} />
        </Box>
    );
}
