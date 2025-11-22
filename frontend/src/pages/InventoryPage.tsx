import { useEffect } from 'react';
import {
    Box,
    Typography,
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
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchStockLevels } from '../store/slices/inventorySlice';

export default function InventoryPage() {
    const dispatch = useAppDispatch();
    const { stockLevels, loading } = useAppSelector((state) => state.inventory);

    useEffect(() => {
        dispatch(fetchStockLevels());
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
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Inventory
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Current stock levels across all warehouses
            </Typography>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Warehouse</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Available</TableCell>
                                    <TableCell align="right">Reserved</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stockLevels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                                No stock levels found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stockLevels.map((stock) => (
                                        <TableRow key={stock.id} hover>
                                            <TableCell>{stock.product?.name || '-'}</TableCell>
                                            <TableCell>{stock.product?.sku || '-'}</TableCell>
                                            <TableCell>{stock.warehouse?.name || '-'}</TableCell>
                                            <TableCell align="right">{Number(stock.quantity).toFixed(2)}</TableCell>
                                            <TableCell align="right">
                                                {Number(stock.availableQuantity).toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {Number(stock.reservedQuantity).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={Number(stock.availableQuantity) > 0 ? 'In Stock' : 'Out of Stock'}
                                                    color={Number(stock.availableQuantity) > 0 ? 'success' : 'error'}
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
