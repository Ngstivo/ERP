import { useState, useEffect, ChangeEvent } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    CircularProgress,
    Box,
} from '@mui/material';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createProduct, fetchProducts } from '../../store/slices/productsSlice';
import { showSuccess, showError } from '../../utils/toast';
import { API_URL } from '../../config/api';

interface ProductDialogProps {
    open: boolean;
    onClose: () => void;
    product?: any;
}

export default function ProductDialog({ open, onClose, product }: ProductDialogProps) {
    const dispatch = useAppDispatch();
    const { token } = useAppSelector((state) => state.auth);
    const [categories, setCategories] = useState<any[]>([]);
    const [uoms, setUoms] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        unitPrice: '',
        costPrice: '',
        reorderPoint: '',
        category: '',
        unitOfMeasure: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        sku: '',
        category: '',
        unitOfMeasure: '',
        unitPrice: '',
        costPrice: '',
        reorderPoint: '',
    });

    const [loading, setLoading] = useState(false);
    const [loadingMetadata, setLoadingMetadata] = useState(false);

    useEffect(() => {
        if (open) {
            fetchMetadata();
        }
    }, [open]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                description: product.description || '',
                unitPrice: product.unitPrice?.toString() || '',
                costPrice: product.costPrice?.toString() || '',
                reorderPoint: product.reorderPoint?.toString() || '',
                category: product.category?.id || '',
                unitOfMeasure: product.unitOfMeasure?.id || '',
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                description: '',
                unitPrice: '',
                costPrice: '',
                reorderPoint: '',
                category: '',
                unitOfMeasure: '',
            });
        }
        // Clear errors
        setErrors({
            name: '',
            sku: '',
            category: '',
            unitOfMeasure: '',
            unitPrice: '',
            costPrice: '',
            reorderPoint: '',
        });
    }, [product, open]);

    const fetchMetadata = async () => {
        setLoadingMetadata(true);
        try {
            const [catRes, uomRes] = await Promise.all([
                axios.get(`${API_URL}/products/categories`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/products/uom`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setCategories(catRes.data);
            setUoms(uomRes.data);
        } catch (error) {
            showError('Failed to load categories and units of measure');
        } finally {
            setLoadingMetadata(false);
        }
    };

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'name':
                return value.trim() === '' ? 'Product name is required' : '';
            case 'sku':
                return value.trim() === '' ? 'SKU is required' : '';
            case 'category':
                return value === '' ? 'Category is required' : '';
            case 'unitOfMeasure':
                return value === '' ? 'Unit of measure is required' : '';
            case 'unitPrice':
                if (value === '') return 'Unit price is required';
                if (isNaN(Number(value)) || Number(value) <= 0) return 'Unit price must be greater than 0';
                return '';
            case 'costPrice':
                if (value === '') return 'Cost price is required';
                if (isNaN(Number(value)) || Number(value) <= 0) return 'Cost price must be greater than 0';
                return '';
            case 'reorderPoint':
                if (value === '') return 'Reorder point is required';
                if (isNaN(Number(value)) || Number(value) < 0) return 'Reorder point cannot be negative';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });
    };

    const validateForm = (): boolean => {
        const newErrors = {
            name: validateField('name', formData.name),
            sku: validateField('sku', formData.sku),
            category: validateField('category', formData.category),
            unitOfMeasure: validateField('unitOfMeasure', formData.unitOfMeasure),
            unitPrice: validateField('unitPrice', formData.unitPrice),
            costPrice: validateField('costPrice', formData.costPrice),
            reorderPoint: validateField('reorderPoint', formData.reorderPoint),
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
            const payload = {
                ...formData,
                unitPrice: Number(formData.unitPrice),
                costPrice: Number(formData.costPrice),
                reorderPoint: Number(formData.reorderPoint),
            };

            if (product) {
                // Update existing product
                await axios.patch(`${API_URL}/products/${product.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Create new product
                await dispatch(createProduct(payload));
            }
            dispatch(fetchProducts());
            showSuccess(product ? 'Product updated successfully!' : 'Product created successfully!');
            onClose();
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.name && formData.sku && formData.category && formData.unitOfMeasure &&
        formData.unitPrice && formData.costPrice && formData.reorderPoint;

    const isDisabled = loading || loadingMetadata;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogContent>
                {loadingMetadata ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="sku"
                                label="SKU"
                                fullWidth
                                value={formData.sku}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.sku}
                                helperText={errors.sku}
                                disabled={!!product || isDisabled}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="name"
                                label="Product Name"
                                fullWidth
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.name}
                                helperText={errors.name}
                                disabled={isDisabled}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                name="category"
                                label="Category"
                                fullWidth
                                value={formData.category}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.category}
                                helperText={errors.category}
                                disabled={isDisabled}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                name="unitOfMeasure"
                                label="Unit of Measure"
                                fullWidth
                                value={formData.unitOfMeasure}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.unitOfMeasure}
                                helperText={errors.unitOfMeasure}
                                disabled={isDisabled}
                            >
                                {uoms.map((uom) => (
                                    <MenuItem key={uom.id} value={uom.id}>
                                        {uom.name} ({uom.abbreviation})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                disabled={isDisabled}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="unitPrice"
                                label="Unit Price"
                                type="number"
                                fullWidth
                                value={formData.unitPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.unitPrice}
                                helperText={errors.unitPrice}
                                inputProps={{ min: 0, step: 0.01 }}
                                disabled={isDisabled}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="costPrice"
                                label="Cost Price"
                                type="number"
                                fullWidth
                                value={formData.costPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.costPrice}
                                helperText={errors.costPrice}
                                inputProps={{ min: 0, step: 0.01 }}
                                disabled={isDisabled}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="reorderPoint"
                                label="Reorder Point"
                                type="number"
                                fullWidth
                                value={formData.reorderPoint}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!errors.reorderPoint}
                                helperText={errors.reorderPoint}
                                inputProps={{ min: 0 }}
                                disabled={isDisabled}
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isDisabled || !isFormValid}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
