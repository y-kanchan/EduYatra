/**
 * API Configuration for Web App
 * 
 * Change the API_URL here to switch between local and production environments
 * 
 * For local development: 'http://localhost:5000/api'
 * For production: 'https://eduyatrabackend.onrender.com/api'
 */

// Change this value to switch between local and production
const USE_PRODUCTION = true;

// API URLs
const LOCAL_API_URL = 'http://localhost:5000/api';
const PRODUCTION_API_URL = 'https://eduyatrabackend.onrender.com/api';
  
// Export the active API URL
export const API_URL = USE_PRODUCTION ? PRODUCTION_API_URL : LOCAL_API_URL;

// Export the base URL without /api for special cases
export const BASE_URL = USE_PRODUCTION 
  ? 'https://eduyatrabackend.onrender.com' 
  : LOCAL_API_URL.replace('/api', '');

// Helper function to construct full API URLs
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};
