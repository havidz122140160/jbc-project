import axios from 'axios';

const api = axios.create({
  // Sesuaikan dengan alamat IP laptop lu biar bisa diakses dari HP
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Kalau server bilang "Siapa lu?", hapus sisa sampah dan balik ke login
      localStorage.clear();
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;