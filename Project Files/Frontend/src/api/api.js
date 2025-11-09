import axios from 'axios';
import { toast } from "sonner"; // Optional: for global error handling

// 1. Create a central axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/' // The base URL for all our API calls
});

// 2. This is an "interceptor"
// It's a piece of code that runs BEFORE every single API request
api.interceptors.request.use(config => {
  // Get the token from localStorage
  const token = localStorage.getItem('authToken');
  
  if (token) {
    // If the token exists, add it to the 'Authorization' header
    config.headers.Authorization = `Token ${token}`;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// 3. (Optional but recommended)
// Add an interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response, // Just return the response if it's successful
  (error) => {
    // Handle errors
    if (error.response?.status === 401) {
      // If we get a 401 (Unauthorized), the token is bad
      // Log the user out and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      
      // Use window.location to force redirect outside of React Router context
      window.location.href = '/login'; 
      toast.error("Session expired. Please log in again.");
    }
    
    // Pass the error on so the component can handle it too
    return Promise.reject(error);
  }
);

// 4. Export the configured instance as the default
export default api;