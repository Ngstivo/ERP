import { useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/slices/productsSlice';

export default function ProductsPage() {
    const dispatch = useAppDispatch();
    const { products, loading } = useAppSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

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
                <Button variant="contained" startIcon={<Add />}>
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
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}
