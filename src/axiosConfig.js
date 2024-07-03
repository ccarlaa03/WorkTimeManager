import axios from 'axios';
import Cookies from 'js-cookie'; // Asigură-te că pachetul js-cookie este importat

// Creăm o instanță Axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});

// Adăugăm un interceptor pentru cereri pentru a adăuga tokenul CSRF
axiosInstance.interceptors.request.use(function (config) {
  const csrfToken = Cookies.get('csrftoken'); // Obținem tokenul CSRF din cookie
  // Dacă tokenul CSRF există, îl setăm în anteturi
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, function (error) {
  // Tratăm eroarea din cerere
  return Promise.reject(error);
});

// Adăugăm un interceptor pentru răspunsuri pentru a trata reîmprospătarea tokenului
axiosInstance.interceptors.response.use(function (response) {
  // Orice cod de stare în intervalul 2xx declanșează această funcție
  return response;
}, async function (error) {
  // Orice cod de stare în afara intervalului 2xx declanșează această funcție
  const originalRequest = error.config;
  
  // Dacă cererea eșuează din cauza unui răspuns 401 Unauthorized, încercăm să obținem un nou token de acces
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Încercăm să obținem un nou token de acces folosind refresh tokenul
      const response = await axiosInstance.post('/api/token/refresh/', {
        refresh: refreshToken,
      });
      
      // Dacă reîmprospătarea tokenului a reușit, setăm noul token de acces și reluăm cererea originală
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axiosInstance(originalRequest);
      }
    } catch (refreshError) {
      console.error('Nu se poate reîmprospăta tokenul:', refreshError);
      // Dacă reîmprospătarea tokenului eșuează, eliminăm tokenurile și respingem promisiunea
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return Promise.reject(refreshError);
    }
  }
  
  return Promise.reject(error);
});

export default axiosInstance;
