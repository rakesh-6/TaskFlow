import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        return rejectWithValue('Failed to fetch notifications');
    }
});

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id, { rejectWithValue }) => {
    try {
        await api.patch(`/notifications/${id}/read`);
        return id;
    } catch (error) {
        return rejectWithValue('Failed to update notification');
    }
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
    },
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
                state.unreadCount = action.payload.filter(n => !n.isRead).length;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notif = state.notifications.find(n => n._id === action.payload);
                if (notif && !notif.isRead) {
                    notif.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });
    },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
