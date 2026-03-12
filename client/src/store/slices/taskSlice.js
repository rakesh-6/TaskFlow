import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async ({ projectId, filters = {} }, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/projects/${projectId}/tasks?${params}`);
        return response.data; // { tasks, total, page, pages }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
});

export const createTask = createAsyncThunk('tasks/createTask', async ({ projectId, data }, { rejectWithValue }) => {
    try {
        const response = await api.post(`/projects/${projectId}/tasks`, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
});

export const updateTaskStatus = createAsyncThunk(
    'tasks/updateTaskStatus',
    async ({ projectId, taskId, status, order }, { rejectWithValue }) => {
        try {
            // Background API call — UI handles optimistic update before dispatching this
            await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status, order });
            return { taskId, status, order };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update task status');
        }
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState: {
        tasks: [],
        total: 0,
        loading: false,
        error: null,
        filters: { status: null, priority: null, assignee: null, q: '' },
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        // Optimistic update for Kanban drag-and-drop
        optimisticTaskUpdate: (state, action) => {
            const { taskId, newStatus, newOrder, previousStateRef } = action.payload;
            // You can store prev state somewhere if needed, but handled at component level normally
            const taskIndex = state.tasks.findIndex(t => t._id === taskId);
            if (taskIndex !== -1) {
                state.tasks[taskIndex].status = newStatus;
                state.tasks[taskIndex].order = newOrder;
            }
        },
        revertOptimisticUpdate: (state, action) => {
            // payload should be the full previous tasks array
            state.tasks = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload.tasks;
                state.total = action.payload.total;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload);
            });
    },
});

export const { setFilters, optimisticTaskUpdate, revertOptimisticUpdate } = taskSlice.actions;
export default taskSlice.reducer;
