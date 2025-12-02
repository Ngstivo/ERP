import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login } from '../store/slices/authSlice';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(login({ email, password }));
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <LockOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" gutterBottom fontWeight={600}>
                                ERP System
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Inventory & Warehouse Management
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                                required
                                autoFocus
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                margin="normal"
                                required
                            />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>


                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
