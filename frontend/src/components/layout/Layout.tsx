import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Toolbar,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    AppBar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Drawer,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Logout,
    Dashboard,
    Inventory,
    Category,
    Warehouse,
    Receipt,
    LocalShipping,
    Assessment,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';

const drawerWidth = 240;

interface LayoutProps {
    children: React.ReactNode;
}

const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
    { text: 'Products', icon: <Category />, path: '/products' },
    { text: 'Warehouses', icon: <Warehouse />, path: '/warehouses' },
    { text: 'Goods Receipt', icon: <Receipt />, path: '/goods-receipt' },
    { text: 'Orders', icon: <LocalShipping />, path: '/orders' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
];

export default function Layout({ children }: LayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
                    WMS
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Inventory & Warehouse Management
                    </Typography>
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2">
                                {user?.firstName} {user?.lastName}
                            </Typography>
                        </MenuItem>
                        <MenuItem disabled>
                            <Typography variant="caption" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
