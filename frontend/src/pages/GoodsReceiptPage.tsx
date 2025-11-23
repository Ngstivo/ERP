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
import { fetchGoodsReceipts } from '../store/slices/goodsReceiptSlice';
import { format } from 'date-fns';

export default function GoodsReceiptPage() {
    const dispatch = useAppDispatch();
    const { receipts, loading } = useAppSelector((state) => state.goodsReceipt);

    useEffect(() => {
        dispatch(fetchGoodsReceipts());
    }, [dispatch]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'success';
            case 'APPROVED':
            case 'PARTIALLY_APPROVED':
                return 'info';
            case 'INSPECTING':
            case 'PENDING_INSPECTION':
                return 'warning';
            case 'REJECTED':
                return 'error';
            default:
                return 'default';
        }
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
                        Goods Receipt
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage incoming goods with quality inspection and put-away
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />}>
                    Create Receipt
                </Button>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Receipt #</TableCell>
                                    <TableCell>PO Number</TableCell>
                                    <TableCell>Warehouse</TableCell>
                                    <TableCell>Receipt Date</TableCell>
                                    <TableCell align="right">Items</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Received By</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {receipts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                                No goods receipts found. Click "Create Receipt" to receive goods from a purchase order.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    receipts.map((receipt: any) => (
                                        <TableRow key={receipt.id} hover>
                                            <TableCell>{receipt.receiptNumber}</TableCell>
                                            <TableCell>{receipt.purchaseOrder?.orderNumber || '-'}</TableCell>
                                            <TableCell>{receipt.warehouse?.name || '-'}</TableCell>
                                            <TableCell>
                                                {receipt.receiptDate
                                                    ? format(new Date(receipt.receiptDate), 'MMM dd, yyyy')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell align="right">{receipt.items?.length || 0}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={receipt.status.replace('_', ' ')}
                                                    color={getStatusColor(receipt.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {receipt.receivedBy
                                                    ? `${receipt.receivedBy.firstName} ${receipt.receivedBy.lastName}`
                                                    : '-'}
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
