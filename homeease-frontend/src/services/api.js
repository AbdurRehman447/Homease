import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // For now, just logout on 401
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  signup: (userData) => api.post('/auth/register/user', userData),
  signupProvider: (providerData) => api.post('/auth/register/provider', providerData),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Services APIs
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getCategories: () => api.get('/services/categories'),
};

// Providers APIs
export const providersAPI = {
  getAll: (params) => api.get('/providers', { params }),
  getById: (id) => api.get(`/providers/${id}`),
  updateProfile: (data) => api.put('/providers/profile', data),
  updateServices: (services) => api.put('/providers/services', { services }),
};

// Bookings APIs
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  updateStatus: (id, status, cancellationReason) =>
    api.patch(`/bookings/${id}/status`, { status, cancellationReason }),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  checkAvailability: (providerId, date, timeSlot) =>
    api.get('/bookings/availability/check', { params: { providerId, date, timeSlot } }),
  getStatistics: (params) => api.get('/bookings/statistics', { params }),
};

// Reviews APIs
export const reviewsAPI = {
  getProviderReviews: (providerId, params) => api.get(`/reviews/provider/${providerId}`, { params }),
  getProviderStats: (providerId) => api.get(`/reviews/provider/${providerId}/stats`),
  create: (reviewData) => api.post('/reviews', reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  respond: (id, response) => api.post(`/reviews/${id}/respond`, { response }),
  getMyReviews: (params) => api.get('/reviews/my-reviews', { params }),
};

// AI APIs (smart search - suggest service from natural language)
export const aiAPI = {
  suggestService: (query) => api.post('/ai/suggest-service', { query }),
};

// Chat APIs
export const chatAPI = {
  getConversations: (params) => api.get('/chat/conversations', { params }),
  getOrCreateConversation: (bookingId) => api.get(`/chat/conversations/booking/${bookingId}`),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (data) => api.post('/chat/messages', data),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Upload APIs
export const uploadAPI = {
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadProviderAvatar: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/provider/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Admin APIs
export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Users management
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Providers management
  getAllProviders: (params) => api.get('/admin/providers', { params }),
  getProviderById: (id) => api.get(`/admin/providers/${id}`),
  createProvider: (data) => api.post('/admin/providers', data),
  updateProvider: (id, data) => api.put(`/admin/providers/${id}`, data),
  deleteProvider: (id) => api.delete(`/admin/providers/${id}`),
  approveProvider: (id) => api.patch(`/admin/providers/${id}/approve`),
  rejectProvider: (id, reason) => api.patch(`/admin/providers/${id}/reject`, { reason }),
  suspendProvider: (id, reason) => api.patch(`/admin/providers/${id}/suspend`, { reason }),

  // Bookings management
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getBookingById: (id) => api.get(`/admin/bookings/${id}`),

  // Services management
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),

  // Analytics
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

// Payments APIs
export const paymentsAPI = {
  getMethods: () => api.get('/payments/methods'),
  process: (paymentData) => api.post('/payments/process', paymentData),
};

export default api;
