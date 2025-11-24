import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchWarehouses } from '../../store/slices/warehousesSlice';

const API_URL = 'https://erp-backend-68v8.onrender.com/api';

interface OrderDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function OrderDialog({ open, onClose }: OrderDialogProps) {
    const dispatch = useAppDispatch();
    const { token } = useAppSelector((state) => state.auth);
    const { products } = useAppSelector((state) => state.products);
    const { warehouses } = useAppSelector((state) => state.warehouses);

    const [formData, setFormData] = useState({
        supplierId: 'mock-supplier-id', // Mock for now as we don't have suppliers module
        warehouseId: '',
        notes: '',
    });

    const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
        { productId: '', quantity: 1 },
    ]);

    useEffect(() => {
        if (open) {
            dispatch(fetchProducts());
            dispatch(fetchWarehouses());
        }
    }, [open, dispatch]);

    const handleAddItem = () => {
        setItems([...items, { productId: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async () => {
        try {
            // Create PO
            await axios.post(
                `${API_URL}/orders/purchase`,
                {
                    ...formData,
                    items: items.map(item => ({
                        product: { id: item.productId },
                        quantity: Number(item.quantity),
                        unitPrice: 0, // Default
                    })),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onClose();
            alert('Purchase Order created successfully!');
        } catch (error) {
            console.error('Failed to create order:', error);
            alert('Failed to create order');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Warehouse"
                            fullWidth
                            value={formData.warehouseId}
                            onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                        >
                            {warehouses.map((w) => (
                                <MenuItem key={w.id} value={w.id}>
                                    {w.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Notes"
                            fullWidth
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Items</Typography>
                            <Button startIcon={<Add />} onClick={handleAddItem}>
                                Add Item
                            </Button>
                        </Box>
                        {items.map((item, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <TextField
                                        select
                                        label="Product"
                                        fullWidth
                                        size="small"
                                        value={item.productId}
                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                    >
                                        {products.map((p) => (
                                            <MenuItem key={p.id} value={p.id}>
                                                {p.name} ({p.sku})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        type="number"
                                        label="Quantity"
                                        fullWidth
                                        size="small"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <IconButton onClick={() => handleRemoveItem(index)} color="error">
                                        <Delete />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.warehouseId || items.some(i => !i.productId)}
                >
                    Create Order
                </Button>
            </DialogActions>
        </Dialog>
    );
}
