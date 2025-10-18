// API configuration using environment variables
const API_HOST = import.meta.env.VITE_API_HOST || 'localhost';
const API_PORT = import.meta.env.VITE_API_PORT || '5000';
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || 'http';
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api';

// Build the base URL - handle both localhost and production cases
let API_BASE_URL: string;
if (API_HOST === 'localhost' || API_HOST === '127.0.0.1') {
  // Local development
  API_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}${API_BASE_PATH}`;
} else {
  // Production - assume standard HTTPS port (443) and custom path
  API_BASE_URL = `${API_PROTOCOL}://${API_HOST}${API_BASE_PATH}`;
}

export const apiEndpoints = {
  health: `${API_BASE_URL}/health`,
  characters: `${API_BASE_URL}/characters`,
  campaigns: `${API_BASE_URL}/campaigns`,
  // Add other endpoints here as you build them
};

export { API_BASE_URL };