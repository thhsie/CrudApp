// --- Updated File: ./my-leaves-client/src/services/api.ts ---
import axios from 'axios';
import { authService } from './authService';

// Create an axios instance
const api = axios.create({
  baseURL: '/', // Use '/' for Vite proxy
  withCredentials: true, // Send cookies
});

// Response interceptor
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Handle errors
    if (error.response) {
      console.error('API Error Response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
      });

      if (error.response.status === 401) {
        // Unauthorized - Logout and redirect to login
        authService.logout().then(() => {
          window.location.href = '/login';
        });
      } else if (error.response.status === 403) {
        console.warn('Interceptor: Forbidden (403). User lacks permissions.');
        // Optionally redirect or show a message
        // window.location.href = '/dashboard?forbidden=true';
      }
      // Add handling for other specific statuses like 400 (Bad Request/Validation), 404, 500
      else if (error.response.status === 400) {
          console.warn('Interceptor: Bad Request (400). Check request data.', error.response.data);
      }

    } else if (error.request) {
      // Network error, BFF/API down, CORS issue
      console.error('API Error Request (No Response):', error.request);
      // Consider showing a global network error message
    } else {
      // Setup error
      console.error('API Error Message:', error.message);
    }

    // Return a rejected promise so components/hooks can also handle it
    return Promise.reject(error);
  }
);

export default api;
