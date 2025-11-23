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
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchWarehouses } from '../store/slices/warehousesSlice';
import WarehouseDialog from '../components/warehouse/WarehouseDialog';

export default function WarehousesPage() {
    const dispatch = useAppDispatch();
    const { warehouses, loading } = useAppSelector((state) => state.warehouses);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        dispatch(fetchWarehouses());
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
                                    <Typography variant="h6" gutterBottom fontWeight={600}>
                                        {warehouse.name}
                                    </Typography>
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

            <WarehouseDialog open={openDialog} onClose={() => setOpenDialog(false)} />
        </Box>
    );
}
