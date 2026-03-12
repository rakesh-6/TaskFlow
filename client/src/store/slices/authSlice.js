import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            localStorage.setItem('accessToken', response.data.accessToken);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            localStorage.setItem('accessToken', response.data.accessToken);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users/me'); // We need to add this endpoint to user.controller.js later
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Session expired');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('accessToken');
            return null;
        } catch (error) {
            return rejectWithValue('Logout failed');
        }
    }
);

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // Init to true so App can verify token before showing protected UI
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setOAuthSession: (state, action) => {
            // Called by AuthCallback page when OAuth returns a token
            localStorage.setItem('accessToken', action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Load User
            .addCase(loadUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loadUser.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, setOAuthSession } = authSlice.actions;
export default authSlice.reducer;
