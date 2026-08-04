import axios from 'axios';

// Points at the separately-deployed Resume backend (set VITE_RESUME_API_URL).
// Falls back to /api for local dev via a proxy.
const RESUME_API_URL = import.meta.env.VITE_RESUME_API_URL?.replace(/\/$/, '') || '';
const BASE = RESUME_API_URL ? `${RESUME_API_URL}/api` : '/api';

// The backend returns file links (résumé PDF/HTML, cover letters) as paths
// relative to itself (e.g. "/api/output/..."). Locally that's the same
// origin as the frontend (nginx proxies /api), but in production the
// frontend (Vercel) and backend (Render) are different origins, so those
// paths must be prefixed with the backend's origin or the browser resolves
// them against the frontend instead and the file 404s.
export const API_ORIGIN = RESUME_API_URL;
export const fileUrl = (path) => (path ? `${API_ORIGIN}${path}` : path);

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
