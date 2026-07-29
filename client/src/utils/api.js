import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Tambahkan token ke setiap request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle error global
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authAPI = {
    login: (identifier, password) =>
        api.post('/auth/login', { identifier, password }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    uploadPhoto: (formData) =>
        api.post('/auth/upload-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
};

// Attendance API
export const attendanceAPI = {
    checkIn: (formData) =>
        api.post('/attendance/check-in', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    checkOut: (formData) =>
        api.post('/attendance/check-out', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    getToday: () => api.get('/attendance/today'),
    getHistory: () => api.get('/attendance/history'),
    getAll: (params) => api.get('/attendance/all', { params }),
    getDashboardStats: () => api.get('/attendance/dashboard-stats'),
    getRecent: () => api.get('/attendance/recent')
};

// User API (Admin)
export const userAPI = {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`)
};

// Schedule API (Admin)
export const scheduleAPI = {
    getAll: () => api.get('/schedules'),
    create: (data) => api.post('/schedules', data),
    update: (id, data) => api.put(`/schedules/${id}`, data)
};

// Location API (Admin)
export const locationAPI = {
    getAll: () => api.get('/locations'),
    create: (data) => api.post('/locations', data),
    update: (id, data) => api.put(`/locations/${id}`, data)
};