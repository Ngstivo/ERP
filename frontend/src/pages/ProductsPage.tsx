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
    CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/slices/productsSlice';
import ProductDialog from '../components/inventory/ProductDialog';
import { showSuccess, showError, showWarning } from '../utils/toast';
import { API_URL } from '../config/api';

export default function ProductsPage() {
    const dispatch = useAppDispatch();
    const { products, loading } = useAppSelector((state) => state.products);
    const { token } = useAppSelector((state) => state.auth);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setOpenDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }
        try {
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(fetchProducts());
            showSuccess('Product deleted successfully!');
        } catch (error) {
            showError(error);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProduct(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight={600}>
                        Products
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your product catalog
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                    Add Product
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Cost Price</TableCell>
                                    <TableCell align="right">Reorder Point</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                                No products found. Click "Add Product" to create your first product.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product.id} hover>
                                            <TableCell>{product.sku}</TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.category?.name || '-'}</TableCell>
                                            <TableCell align="right">
                                                ${Number(product.unitPrice).toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">
                                                ${Number(product.costPrice).toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">{product.reorderPoint}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label="Active"
                                                    color="success"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    onClick={() => handleEdit(product)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <ProductDialog
                open={openDialog}
                onClose={handleCloseDialog}
                product={editingProduct}
            />
        </Box>
    );
}
