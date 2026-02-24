// frontend/src/lib/api/public.ts
import axios from 'axios';
import { API_URL } from '../../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== PUBLIC CONTENT ====================
// These endpoints don't require authentication

export const getPublicSliders = async () => {
  const response = await api.get('/public/sliders');
  return response.data;
};

export const getPublicPosters = async () => {
  const response = await api.get('/public/posters');
  return response.data;
};

export const getPublicAds = async () => {
  const response = await api.get('/public/ads');
  return response.data;
};

export const getPublicSuccessStories = async () => {
  const response = await api.get('/public/success-stories');
  return response.data;
};

export const getPublicVideo = async () => {
  const response = await api.get('/public/videos');
  return response.data;
};

export default api;
