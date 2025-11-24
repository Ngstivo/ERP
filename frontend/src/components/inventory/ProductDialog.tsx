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
} from '@mui/material';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createProduct, fetchProducts } from '../../store/slices/productsSlice';
import { showSuccess, showError } from '../../utils/toast';

const API_URL = 'https://erp-backend-68v8.onrender.com/api';

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
    }, [product, open]);

    const fetchMetadata = async () => {
        try {
            const [catRes, uomRes] = await Promise.all([
                axios.get(`${API_URL}/products/categories`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/products/uom`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setCategories(catRes.data);
            setUoms(uomRes.data);
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
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
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="sku"
                            label="SKU"
                            fullWidth
                            value={formData.sku}
                            onChange={handleChange}
                            disabled={!!product}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="name"
                            label="Product Name"
                            fullWidth
                            value={formData.name}
                            onChange={handleChange}
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
                        >
                            {uoms.map((uom) => (
                                <MenuItem key={uom.id} value={uom.id}>
                                    {uom.name} ({uom.code})
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
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.name || !formData.sku || !formData.category || !formData.unitOfMeasure}
                >
                    {product ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
