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
import { showSuccess, showError } from '../../utils/toast';

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

    const [errors, setErrors] = useState({
        warehouse: '',
        items: '',
    });

    useEffect(() => {
        if (open) {
            dispatch(fetchProducts());
            dispatch(fetchWarehouses());
            // Reset form
            setFormData({ suppress: 'mock-supplier-id', warehouseId: '', notes: '' });
            setItems([{ productId: '', quantity: 1 }]);
            setErrors({ warehouse: '', items: '' });
        }
    }, [open, dispatch]);

    const handleAddItem = () => {
        setItems([...items, { productId: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const validateForm = (): boolean => {
        const newErrors = { warehouse: '', items: '' };

        // Validate warehouse selection
        if (!formData.warehouseId) {
            newErrors.warehouse = 'Please select a warehouse';
        }

        // Validate items
        if (items.length === 0) {
            newErrors.items = 'At least one item is required';
        } else if (items.some(item => !item.productId)) {
            newErrors.items = 'All items must have a product selected';
        } else if (items.some(item => !item.quantity || item.quantity <= 0)) {
            newErrors.items = 'All items must have a quantity greater than 0';
        } else {
            // Check for duplicate products
            const productIds = items.map(item => item.productId);
            const uniqueIds = new Set(productIds);
            if (productIds.length !== uniqueIds.size) {
                newErrors.items = 'Duplicate products are not allowed';
            }
        }

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showError('Please fix all validation errors before submitting');
            return;
        }

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
            showSuccess('Purchase Order created successfully!');
        } catch (error) {
            showError(error);
        }
    };

    const isFormValid = formData.warehouseId && items.every(item => item.productId && item.quantity > 0);

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
                            onChange={(e) => {
                                setFormData({ ...formData, warehouseId: e.target.value });
                                if (errors.warehouse) setErrors({ ...errors, warehouse: '' });
                            }}
                            error={!!errors.warehouse}
                            helperText={errors.warehouse}
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
                        {errors.items && (
                            <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
                                {errors.items}
                            </Typography>
                        )}
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
                                        error={!item.productId && !!errors.items}
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
                                        error={(item.quantity <= 0 || !item.quantity) && !!errors.items}
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <IconButton
                                        onClick={() => handleRemoveItem(index)}
                                        color="error"
                                        disabled={items.length === 1}
                                    >
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
                    disabled={!isFormValid}
                >
                    Create Order
                </Button>
            </DialogActions>
        </Dialog>
    );
}
