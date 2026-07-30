import axios from 'axios';

// Points at the separately-deployed Resume backend (set VITE_RESUME_API_URL).
// Falls back to /api for local dev via a proxy.
const BASE = import.meta.env.VITE_RESUME_API_URL
  ? `${import.meta.env.VITE_RESUME_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Resume backend rejected the auto-obtained token — re-gate.
      localStorage.removeItem('token');
      localStorage.removeItem('resume_token');
      if (!window.location.pathname.startsWith('/resume-builder')) {
        window.location.href = '/resume-builder';
      } else {
        window.location.reload();
      }
    }
    return Promise.reject(err);
  }
);

export default api;
