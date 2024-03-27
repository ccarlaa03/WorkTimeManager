// axiosConfig.js
import axios from 'axios';
import Cookies from 'js-cookie'; // Ensure js-cookie package is imported

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add a request interceptor to add the CSRF token
axiosInstance.interceptors.request.use(function (config) {
  const csrfToken = Cookies.get('csrftoken'); // Fetch the CSRF token from the cookie
  // If the CSRF token exists, set it in the headers
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(function (response) {
  // Any status code that lies within the range of 2xx cause this function to trigger
  return response;
}, async function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  const originalRequest = error.config;
  
  // If the request fails due to a 401 Unauthorized response, try to get a new access token
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Attempt to get a new access token using the refresh token
      const response = await axiosInstance.post('/api/token/refresh/', {
        refresh: refreshToken,
      });
      
      // If the token refresh was successful, set the new access token and retry the original request
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axiosInstance(originalRequest);
      }
    } catch (refreshError) {
      console.error('Unable to refresh token:', refreshError);
      // If token refresh fails, remove tokens and reject the promise
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return Promise.reject(refreshError);
    }
  }
  
  return Promise.reject(error);
});

export default axiosInstance;
