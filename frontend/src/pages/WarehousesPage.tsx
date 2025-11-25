import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import WarehouseDialog from '../components/warehouse/WarehouseDialog';
import { API_URL } from '../config/api';

export default function WarehousesPage() {
    const dispatch = useAppDispatch();
    const { warehouses, loading } = useAppSelector((state) => state.warehouses);
    const { token } = useAppSelector((state) => state.auth);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchWarehouses());
    }, [dispatch]);

    const handleEdit = (warehouse: any) => {
        setEditingWarehouse(warehouse);
        setOpenDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this warehouse?')) {
            try {
                await axios.delete(`${API_URL}/warehouses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                dispatch(fetchWarehouses());
            } catch (error) {
                console.error('Failed to delete warehouse:', error);
                alert('Failed to delete warehouse');
            }
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingWarehouse(null);
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
                        Warehouses
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your warehouse locations
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                    Add Warehouse
                </Button>
            </Box>

            <Grid container spacing={3}>
                {warehouses.length === 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                    No warehouses found. Click "Add Warehouse" to create your first warehouse.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    warehouses.map((warehouse) => (
                        <Grid item xs={12} md={6} lg={4} key={warehouse.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6" gutterBottom fontWeight={600}>
                                            {warehouse.name}
                                        </Typography>
                                        <Box>
                                            <Button
                                                size="small"
                                                onClick={() => handleEdit(warehouse)}
                                                sx={{ minWidth: 'auto', p: 0.5, mr: 1 }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(warehouse.id)}
                                                sx={{ minWidth: 'auto', p: 0.5 }}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Code: {warehouse.code}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {warehouse.address}
                                    </Typography>
                                    {warehouse.city && (
                                        <Typography variant="body2" color="text.secondary">
                                            {warehouse.city}, {warehouse.country}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            <WarehouseDialog
                open={openDialog}
                onClose={handleCloseDialog}
                warehouse={editingWarehouse}
            />
        </Box>
    );
}
