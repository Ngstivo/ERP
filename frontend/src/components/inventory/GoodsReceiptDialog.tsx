import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createGoodsReceipt } from '../../store/slices/goodsReceiptSlice';
import { fetchWarehouses } from '../../store/slices/warehousesSlice';

const API_URL = 'https://erp-backend-68v8.onrender.com/api';

interface GoodsReceiptDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function GoodsReceiptDialog({ open, onClose }: GoodsReceiptDialogProps) {
    const dispatch = useAppDispatch();
    const { token } = useAppSelector((state) => state.auth);
    const { warehouses } = useAppSelector((state) => state.warehouses);

    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loadingPOs, setLoadingPOs] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);

    const [formData, setFormData] = useState({
        purchaseOrderId: '',
        warehouseId: '',
        notes: '',
        supplierDeliveryNote: '',
        transportCompany: '',
        vehicleNumber: '',
        driverName: '',
    });

    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            dispatch(fetchWarehouses());
            fetchPurchaseOrders();
        } else {
            // Reset state on close
            setFormData({
                purchaseOrderId: '',
                warehouseId: '',
                notes: '',
                supplierDeliveryNote: '',
                transportCompany: '',
                vehicleNumber: '',
                driverName: '',
            });
            setSelectedPO(null);
            setItems([]);
        }
    }, [open, dispatch]);

    const fetchPurchaseOrders = async () => {
        setLoadingPOs(true);
        try {
            const response = await axios.get(`${API_URL}/orders/purchase`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPurchaseOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch purchase orders:', error);
        } finally {
            setLoadingPOs(false);
        }
    };

    const handlePOChange = async (poId: string) => {
        setFormData({ ...formData, purchaseOrderId: poId });
        if (!poId) {
            setSelectedPO(null);
            setItems([]);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/orders/purchase/${poId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const po = response.data;
            setSelectedPO(po);

            // Initialize items with ordered quantity
            const initialItems = po.items.map((item: any) => ({
                purchaseOrderItemId: item.id,
                productName: item.product.name,
                orderedQuantity: item.quantity,
                receivedQuantity: item.quantity, // Default to full receipt
            }));
            setItems(initialItems);
        } catch (error) {
            console.error('Failed to fetch PO details:', error);
        }
    };

    const handleQuantityChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index].receivedQuantity = Number(value);
        setItems(newItems);
    };

    const handleSubmit = async () => {
        try {
            await dispatch(createGoodsReceipt({
                ...formData,
                items: items.map(item => ({
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    receivedQuantity: item.receivedQuantity,
                })),
            }));
            onClose();
        } catch (error) {
            console.error('Failed to create goods receipt:', error);
            alert('Failed to create goods receipt');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create Goods Receipt</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Purchase Order"
                            fullWidth
                            value={formData.purchaseOrderId}
                            onChange={(e) => handlePOChange(e.target.value)}
                            disabled={loadingPOs}
                        >
                            {purchaseOrders.map((po) => (
                                <MenuItem key={po.id} value={po.id}>
                                    {po.orderNumber} - {po.supplier?.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Warehouse"
                            fullWidth
                            value={formData.warehouseId}
                            onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                        >
                            {warehouses.map((w) => (
                                <MenuItem key={w.id} value={w.id}>
                                    {w.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Supplier Delivery Note"
                            fullWidth
                            value={formData.supplierDeliveryNote}
                            onChange={(e) => setFormData({ ...formData, supplierDeliveryNote: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Transport Company"
                            fullWidth
                            value={formData.transportCompany}
                            onChange={(e) => setFormData({ ...formData, transportCompany: e.target.value })}
                        />
                    </Grid>

                    {items.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Items to Receive
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Ordered</TableCell>
                                        <TableCell align="right" width={150}>Received</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={item.purchaseOrderItemId}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell align="right">{item.orderedQuantity}</TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={item.receivedQuantity}
                                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                    inputProps={{ min: 0 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            label="Notes"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.purchaseOrderId || !formData.warehouseId || items.length === 0}
                >
                    Create Receipt
                </Button>
            </DialogActions>
        </Dialog>
    );
}
