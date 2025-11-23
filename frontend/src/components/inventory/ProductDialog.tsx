import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
} from '@mui/material';
import { useAppDispatch } from '../../hooks/redux';
import { createProduct } from '../../store/slices/productsSlice';

interface ProductDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function ProductDialog({ open, onClose }: ProductDialogProps) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        unitPrice: '',
        costPrice: '',
        reorderPoint: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        await dispatch(createProduct({
            ...formData,
            unitPrice: Number(formData.unitPrice),
            costPrice: Number(formData.costPrice),
            reorderPoint: Number(formData.reorderPoint),
        }));
        onClose();
        setFormData({ name: '', sku: '', description: '', unitPrice: '', costPrice: '', reorderPoint: '' });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="sku"
                            label="SKU"
                            fullWidth
                            value={formData.sku}
                            onChange={handleChange}
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
                <Button onClick={handleSubmit} variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    );
}
