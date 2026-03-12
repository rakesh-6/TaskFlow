import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/projects');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
});

export const createProject = createAsyncThunk('projects/createProject', async (projectData, { rejectWithValue }) => {
    try {
        const response = await api.post('/projects', projectData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
});

export const updateProject = createAsyncThunk('projects/updateProject', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/projects/${id}`, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
});

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/projects/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
});

export const fetchProjectDetails = createAsyncThunk('projects/fetchProjectDetails', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch project details');
    }
});

const projectSlice = createSlice({
    name: 'projects',
    initialState: {
        projects: [],
        currentProject: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentProject: (state) => {
            state.currentProject = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(createProject.fulfilled, (state, action) => {
                state.projects.unshift(action.payload);
            })

            .addCase(updateProject.fulfilled, (state, action) => {
                const index = state.projects.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.projects[index] = action.payload;
                }
                if (state.currentProject?._id === action.payload._id) {
                    state.currentProject = action.payload;
                }
            })

            .addCase(deleteProject.fulfilled, (state, action) => {
                state.projects = state.projects.filter(p => p._id !== action.payload);
                if (state.currentProject?._id === action.payload) {
                    state.currentProject = null;
                }
            })

            .addCase(fetchProjectDetails.pending, (state) => { state.loading = true; })
            .addCase(fetchProjectDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProject = action.payload;
            })
            .addCase(fetchProjectDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
