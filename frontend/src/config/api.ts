// API configuration using environment variables
const API_HOST = import.meta.env.VITE_API_HOST || 'localhost';
const API_PORT = import.meta.env.VITE_API_PORT || '5000';
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || 'http';
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api';

// Check if we're in production mode (built/deployed)
const IS_PRODUCTION = import.meta.env.PROD;

// Build the base URL - handle development vs production
let API_BASE_URL: string;
if (IS_PRODUCTION) {
  // Production build - use relative path (will use same host as frontend)
  API_BASE_URL = API_BASE_PATH;
} else if (API_HOST === 'localhost' || API_HOST === '127.0.0.1') {
  // Local development
  API_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}${API_BASE_PATH}`;
} else {
  // Development but connecting to remote server
  API_BASE_URL = `${API_PROTOCOL}://${API_HOST}${API_BASE_PATH}`;
}

export const apiEndpoints = {
  health: `${API_BASE_URL}/health`,
  characters: `${API_BASE_URL}/characters`,
  campaigns: `${API_BASE_URL}/campaigns`,
  // Add other endpoints here as you build them
};

export { API_BASE_URL };