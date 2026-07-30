import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "/api/v1/"}`.replace(/portfolio\/?$/, "") + "notes/",
  timeout: 20000,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("notes_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Don't reload on a failed login attempt — let the screen show the error.
    if (err.response?.status === 401 && !String(err.config?.url || "").includes("login")) {
      localStorage.removeItem("notes_token");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

const ok = (r) => r.data;

export const notesLogin = (password) => api.post("login", { password }).then(ok);

// Sections
export const getSections = () => api.get("sections").then(ok);
export const createSection = (data) => api.post("sections", data).then(ok);
export const updateSection = (id, data) => api.put(`sections/${id}`, data).then(ok);
export const deleteSection = (id) => api.delete(`sections/${id}`).then(ok);

// Notes within a section
export const getSectionNotes = (id) => api.get(`sections/${id}/notes`).then(ok);
export const createNote = (data) => api.post("notes", data).then(ok);
export const updateNote = (id, data) => api.put(`notes/${id}`, data).then(ok);
export const deleteNote = (id) => api.delete(`notes/${id}`).then(ok);
