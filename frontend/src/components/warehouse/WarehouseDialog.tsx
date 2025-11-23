import { useState, useEffect, ChangeEvent } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
} from '@mui/material';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createWarehouse, fetchWarehouses } from '../../store/slices/warehousesSlice';

const API_URL = 'https://erp-backend-68v8.onrender.com/api';

interface WarehouseDialogProps {
    open: boolean;
    onClose: () => void;
    warehouse?: any;
}

export default function WarehouseDialog({ open, onClose, warehouse }: WarehouseDialogProps) {
    const dispatch = useAppDispatch();
    const { token } = useAppSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        city: '',
        country: '',
    });

    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name || '',
                code: warehouse.code || '',
                address: warehouse.address || '',
                city: warehouse.city || '',
                country: warehouse.country || '',
            });
        } else {
            setFormData({ name: '', code: '', address: '', city: '', country: '' });
        }
    }, [warehouse, open]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (warehouse) {
                // Update existing warehouse
                await axios.patch(`${API_URL}/warehouses/${warehouse.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Create new warehouse
                await dispatch(createWarehouse(formData));
            }
            dispatch(fetchWarehouses());
            onClose();
        } catch (error) {
            console.error('Failed to save warehouse:', error);
            alert('Failed to save warehouse');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="code"
                            label="Warehouse Code"
                            fullWidth
                            value={formData.code}
                            onChange={handleChange}
                            disabled={!!warehouse}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="name"
                            label="Warehouse Name"
                            fullWidth
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="address"
                            label="Address"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="city"
                            label="City"
                            fullWidth
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="country"
                            label="Country"
                            fullWidth
                            value={formData.country}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {warehouse ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
