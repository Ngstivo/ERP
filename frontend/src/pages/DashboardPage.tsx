import { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Button,
} from '@mui/material';
import {
    Inventory,
    Warehouse,
    TrendingUp,
    Warning,
    Storage,
} from '@mui/icons-material';
import axios from 'axios';
import { useAppSelector } from '../hooks/redux';
import { showSuccess, showError } from '../utils/toast';
import { API_URL } from '../config/api';

interface DashboardMetrics {
    totalWarehouses: number;
    totalProducts: number;
    totalStockValue: number;
    lowStockItems: number;
    expiringBatches: number;
    pendingTransfers: number;
    recentMovements: number;
    warehouseUtilization: number;
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/reports/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMetrics(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
        fetchMetrics();
    }, [token]); // Refetches when component mounts

    const handleSeed = async () => {
        try {
            await axios.post(`${API_URL}/auth/seed`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showSuccess('System data seeded successfully! You can now create products.');
            window.location.reload();
        } catch (error) {
            showError(error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const statCards = [
        {
            title: 'Total Warehouses',
            value: metrics?.totalWarehouses || 0,
            icon: <Warehouse sx={{ fontSize: 40 }} />,
            color: '#1976d2',
        },
        {
            title: 'Total Products',
            value: metrics?.totalProducts || 0,
            icon: <Inventory sx={{ fontSize: 40 }} />,
            color: '#2e7d32',
        },
        {
            title: 'Total Stock Value',
            value: `$${(metrics?.totalStockValue || 0).toLocaleString()}`,
            icon: <TrendingUp sx={{ fontSize: 40 }} />,
            color: '#ed6c02',
        },
        {
            title: 'Low Stock Items',
            value: metrics?.lowStockItems || 0,
            icon: <Warning sx={{ fontSize: 40 }} />,
            color: '#d32f2f',
        },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Overview of your inventory and warehouse operations
            </Typography>

            <Grid container spacing={3}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                                color: 'white',
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={700}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                                            {card.title}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ opacity: 0.3 }}>{card.icon}</Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Recent Activity
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                No recent activity to display
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Quick Actions
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<Storage />}
                                fullWidth
                                onClick={handleSeed}
                                sx={{ mb: 2 }}
                            >
                                Seed System Data
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                • Add new product
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Create purchase order
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Adjust stock levels
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
