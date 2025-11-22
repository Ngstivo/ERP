import { Box, Typography, Card, CardContent } from '@mui/material';

export default function ReportsPage() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Analytics and reporting
            </Typography>

            <Card>
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        Advanced reports and analytics coming soon...
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
