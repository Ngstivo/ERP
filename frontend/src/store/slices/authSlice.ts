import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }) => {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        return response.data;
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    }
);

export const getProfile = createAsyncThunk('auth/profile', async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    return response.data;
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.access_token;
                state.isAuthenticated = true;
                localStorage.setItem('token', action.payload.access_token);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Login failed';
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.access_token;
                state.isAuthenticated = true;
                localStorage.setItem('token', action.payload.access_token);
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Registration failed';
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
