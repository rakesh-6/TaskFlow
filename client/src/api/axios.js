import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// A separate instance for refreshing tokens specifically (prevents interceptor loops)
const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Fast-fail if not an auth error or if we've already retried
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Explicitly check for our custom TOKEN_EXPIRED code if the backend sends it
        // If it's a generic 401 (e.g. wrong password), don't trigger refresh loop
        const isTokenExpired = error.response?.data?.code === 'TOKEN_EXPIRED' ||
            error.response?.data?.message?.toLowerCase().includes('expired') ||
            error.response?.data?.message?.toLowerCase().includes('failed');

        if (!isTokenExpired) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await refreshApi.post('/auth/refresh');
            localStorage.setItem('accessToken', data.accessToken);

            processQueue(null, data.accessToken);

            originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('accessToken');

            // Redirect to login if user isn't already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
