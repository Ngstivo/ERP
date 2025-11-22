import { Box, Typography, Card, CardContent } from '@mui/material';

export default function OrdersPage() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Orders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage purchase and sales orders
            </Typography>

            <Card>
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        Orders management coming soon...
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
