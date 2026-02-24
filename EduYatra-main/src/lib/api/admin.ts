// frontend/src/lib/api/admin.ts
import axios from 'axios';
import { API_URL } from '../../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

export const getAnalytics = async (period = '30') => {
  const response = await api.get(`/admin/analytics?period=${period}`);
  return response.data;
};

// ==================== USER MANAGEMENT ====================
export const listAllStudents = async (params: any) => {
  const response = await api.get('/admin/students', { params });
  return response.data;
};

export const listAllTeachers = async (params: any) => {
  const response = await api.get('/admin/teachers', { params });
  return response.data;
};

export const getUserDetails = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const updateUser = async (userId: string, updates: any) => {
  const response = await api.put(`/admin/users/${userId}`, updates);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const suspendUser = async (userId: string, duration = 30) => {
  const response = await api.post(`/admin/users/${userId}/suspend`, { duration });
  return response.data;
};

export const activateUser = async (userId: string) => {
  const response = await api.post(`/admin/users/${userId}/activate`);
  return response.data;
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
  const response = await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
  return response.data;
};

// ==================== CLASS MANAGEMENT ====================
export const listAllClasses = async (params: any) => {
  const response = await api.get('/admin/classes', { params });
  return response.data;
};

export const getClassDetails = async (classId: string) => {
  const response = await api.get(`/admin/classes/${classId}/details`);
  return response.data;
};

// ==================== CONTENT MANAGEMENT ====================
// Sliders
export const listSliders = async (params: any) => {
  const response = await api.get('/admin/content/sliders', { params });
  return response.data;
};

export const createSlider = async (sliderData: any) => {
  const response = await api.post('/admin/content/sliders', sliderData);
  return response.data;
};

export const updateSlider = async (sliderId: string, updates: any) => {
  const response = await api.put(`/admin/content/sliders/${sliderId}`, updates);
  return response.data;
};

export const deleteSlider = async (sliderId: string) => {
  const response = await api.delete(`/admin/content/sliders/${sliderId}`);
  return response.data;
};

// Posters
export const listPosters = async (params: any) => {
  const response = await api.get('/admin/content/posters', { params });
  return response.data;
};

export const createPoster = async (posterData: any) => {
  const response = await api.post('/admin/content/posters', posterData);
  return response.data;
};

export const updatePoster = async (posterId: string, updates: any) => {
  const response = await api.put(`/admin/content/posters/${posterId}`, updates);
  return response.data;
};

export const deletePoster = async (posterId: string) => {
  const response = await api.delete(`/admin/content/posters/${posterId}`);
  return response.data;
};

// Ads
export const listAds = async (params: any) => {
  const response = await api.get('/admin/content/ads', { params });
  return response.data;
};

export const createAd = async (adData: any) => {
  const response = await api.post('/admin/content/ads', adData);
  return response.data;
};

export const updateAd = async (adId: string, updates: any) => {
  const response = await api.put(`/admin/content/ads/${adId}`, updates);
  return response.data;
};

export const deleteAd = async (adId: string) => {
  const response = await api.delete(`/admin/content/ads/${adId}`);
  return response.data;
};

// Success Stories
export const listSuccessStories = async (params: any) => {
  const response = await api.get('/admin/content/success-stories', { params });
  return response.data;
};

export const createSuccessStory = async (storyData: any) => {
  const response = await api.post('/admin/content/success-stories', storyData);
  return response.data;
};

export const updateSuccessStory = async (storyId: string, updates: any) => {
  const response = await api.put(`/admin/content/success-stories/${storyId}`, updates);
  return response.data;
};

export const deleteSuccessStory = async (storyId: string) => {
  const response = await api.delete(`/admin/content/success-stories/${storyId}`);
  return response.data;
};

// ==================== SUPPORT ====================
export const listSupportTickets = async (params: any) => {
  const response = await api.get('/admin/tickets', { params });
  return response.data;
};

export const updateTicketStatus = async (ticketId: string, status: string, response?: string) => {
  const res = await api.put(`/admin/tickets/${ticketId}`, { status, response });
  return res.data;
};

// ==================== SYSTEM ====================
export const getSystemSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSystemSetting = async (key: string, value: any) => {
  const response = await api.put('/admin/settings', { key, value });
  return response.data;
};

export const getAuditLogs = async (params: any) => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};

// ==================== ADMIN MANAGEMENT ====================
export const listAllAdmins = async (params: any) => {
  const response = await api.get('/admin/admins', { params });
  return response.data;
};

// ==================== EXAM MANAGEMENT ====================
export const listAllExams = async (params: any) => {
  const response = await api.get('/admin/exams', { params });
  return response.data;
};

export const getExamDetails = async (examId: string) => {
  const response = await api.get(`/admin/exams/${examId}`);
  return response.data;
};

export const deleteExam = async (examId: string) => {
  const response = await api.delete(`/admin/exams/${examId}`);
  return response.data;
};

export const updateExamStatus = async (examId: string, status: string) => {
  const response = await api.put(`/admin/exams/${examId}/status`, { status });
  return response.data;
};

// ==================== QUESTION BANK MANAGEMENT ====================
export const listAllQuestionBanks = async (params: any) => {
  const response = await api.get('/admin/question-banks', { params });
  return response.data;
};

export const getQuestionBankDetails = async (bankId: string) => {
  const response = await api.get(`/admin/question-banks/${bankId}`);
  return response.data;
};

export const createQuestionBank = async (bankData: any) => {
  const response = await api.post('/admin/question-banks', bankData);
  return response.data;
};

export const updateQuestionBank = async (bankId: string, updates: any) => {
  const response = await api.put(`/admin/question-banks/${bankId}`, updates);
  return response.data;
};

export const deleteQuestionBank = async (bankId: string) => {
  const response = await api.delete(`/admin/question-banks/${bankId}`);
  return response.data;
};

// ==================== ADMIN CODE MANAGEMENT ====================
export const listAdminCodes = async (params: any) => {
  const response = await api.get('/admin/admin-codes', { params });
  return response.data;
};

export const createAdminCode = async (codeData: any) => {
  const response = await api.post('/admin/admin-codes', codeData);
  return response.data;
};

export const deleteAdminCode = async (codeId: string) => {
  const response = await api.delete(`/admin/admin-codes/${codeId}`);
  return response.data;
};

export const toggleAdminCodeStatus = async (codeId: string) => {
  const response = await api.put(`/admin/admin-codes/${codeId}/toggle`);
  return response.data;
};

// ==================== INSTITUTE MANAGEMENT ====================
export const listInstitutes = async (params: any) => {
  const response = await api.get('/admin/institutes', { params });
  return response.data;
};

export const createInstitute = async (data: any) => {
  const response = await api.post('/admin/institutes', data);
  return response.data;
};

export const updateInstitute = async (instituteId: string, data: any) => {
  const response = await api.put(`/admin/institutes/${instituteId}`, data);
  return response.data;
};

export const deleteInstitute = async (instituteId: string) => {
  const response = await api.delete(`/admin/institutes/${instituteId}`);
  return response.data;
};

// ==================== PERMISSION MANAGEMENT ====================
export const updateAdminPermissions = async (adminId: string, permissions: string[]) => {
  const response = await api.put(`/admin/admins/${adminId}/permissions`, { permissions });
  return response.data;
};

export const getAdminPermissions = async (adminId: string) => {
  const response = await api.get(`/admin/admins/${adminId}/permissions`);
  return response.data;
};

export const createSuperAdmin = async (data: any) => {
  const response = await api.post('/admin/create-superadmin', data);
  return response.data;
};

// ==================== VIDEO MANAGEMENT ====================
export const listVideos = async (params: any) => {
  const response = await api.get('/admin/content/videos', { params });
  return response.data;
};

export const createVideo = async (videoData: any) => {
  const response = await api.post('/admin/content/videos', videoData);
  return response.data;
};

export const updateVideo = async (videoId: string, videoData: any) => {
  const response = await api.put(`/admin/content/videos/${videoId}`, videoData);
  return response.data;
};

export const deleteVideo = async (videoId: string) => {
  const response = await api.delete(`/admin/content/videos/${videoId}`);
  return response.data;
};
