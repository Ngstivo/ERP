import { useState, useEffect, ChangeEvent } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createWarehouse, fetchWarehouses } from '../../store/slices/warehousesSlice';
import { showSuccess, showError } from '../../utils/toast';
import { API_URL } from '../../config/api';

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

    const [errors, setErrors] = useState({
        name: '',
        code: '',
        city: '',
        country: '',
    });

    const [loading, setLoading] = useState(false);

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
        // Clear errors when dialog opens
        setErrors({ name: '', code: '', city: '', country: '' });
    }, [warehouse, open]);

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'name':
                return value.trim() === '' ? 'Warehouse name is required' : '';
            case 'code':
                if (value.trim() === '') return 'Warehouse code is required';
                if (!/^[A-Z0-9]+$/.test(value)) return 'Code must be uppercase alphanumeric';
                return '';
            case 'city':
                return value.trim() === '' ? 'City is required' : '';
            case 'country':
                return value.trim() === '' ? 'Country is required' : '';
            default:
                return '';
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // For code field, auto-uppercase
        const finalValue = name === 'code' ? value.toUpperCase() : value;
        setFormData({ ...formData, [name]: finalValue });

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name in errors) {
            const error = validateField(name, value);
            setErrors({ ...errors, [name]: error });
        }
    };

    const validateForm = (): boolean => {
        const newErrors = {
            name: validateField('name', formData.name),
            code: validateField('code', formData.code),
            city: validateField('city', formData.city),
            country: validateField('country', formData.country),
        };

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showError('Please fix all validation errors before submitting');
            return;
        }

        setLoading(true);
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
            showSuccess(warehouse ? 'Warehouse updated successfully!' : 'Warehouse created successfully!');
            onClose();
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
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
                            onBlur={handleBlur}
                            error={!!errors.code}
                            helperText={errors.code || 'Uppercase alphanumeric (e.g., WH001)'}
                            disabled={!!warehouse || loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="name"
                            label="Warehouse Name"
                            fullWidth
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.name}
                            helperText={errors.name}
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="city"
                            label="City"
                            fullWidth
                            value={formData.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.city}
                            helperText={errors.city}
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="country"
                            label="Country"
                            fullWidth
                            value={formData.country}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!errors.country}
                            helperText={errors.country}
                            disabled={loading}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !formData.name || !formData.code || !formData.city || !formData.country}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {loading ? 'Saving...' : (warehouse ? 'Update' : 'Create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
