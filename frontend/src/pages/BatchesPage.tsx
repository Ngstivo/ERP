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
import { Add, Warning } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBatches } from '../store/slices/batchesSlice';
import { format } from 'date-fns';

export default function BatchesPage() {
    const dispatch = useAppDispatch();
    const { batches, loading } = useAppSelector((state) => state.batches);

    useEffect(() => {
        dispatch(fetchBatches());
    }, [dispatch]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
            case 'RELEASED':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'REJECTED':
                return 'error';
            case 'QUARANTINE':
                return 'default';
            default:
                return 'default';
        }
    };

    const getDaysUntilExpiration = (expirationDate: any) => {
        if (!expirationDate) return null;
        const today = new Date();
        const expiry = new Date(expirationDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
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
                        Batch & Lot Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track batches with expiration dates and quality control
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />}>
                    Add Batch
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Batch Number</TableCell>
                                    <TableCell>Lot Number</TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Warehouse</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell>Expiration</TableCell>
                                    <TableCell>Quality Status</TableCell>
                                    <TableCell>Alert</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {batches.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                                No batches found. Click "Add Batch" to create your first batch.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    batches.map((batch) => {
                                        const daysUntilExpiry = getDaysUntilExpiration(batch.expirationDate);
                                        const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                                        const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

                                        return (
                                            <TableRow key={batch.id} hover>
                                                <TableCell>{batch.batchNumber}</TableCell>
                                                <TableCell>{batch.lotNumber || '-'}</TableCell>
                                                <TableCell>{batch.product?.name || '-'}</TableCell>
                                                <TableCell>{batch.warehouse?.name || '-'}</TableCell>
                                                <TableCell align="right">
                                                    {Number(batch.currentQuantity).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {batch.expirationDate
                                                        ? format(new Date(batch.expirationDate), 'MMM dd, yyyy')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={batch.qualityStatus}
                                                        color={getStatusColor(batch.qualityStatus)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {isExpired && (
                                                        <Chip
                                                            icon={<Warning />}
                                                            label="Expired"
                                                            color="error"
                                                            size="small"
                                                        />
                                                    )}
                                                    {isExpiringSoon && (
                                                        <Chip
                                                            icon={<Warning />}
                                                            label={`${daysUntilExpiry} days left`}
                                                            color="warning"
                                                            size="small"
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}
