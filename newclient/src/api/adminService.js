import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "/api/v1/").replace("portfolio", "admin").replace(/portfolio\/$/, "admin/"),
  timeout: 20000,
});

// Recompute baseURL cleanly
api.defaults.baseURL = `${import.meta.env.VITE_API_URL || "/api/v1/"}`.replace(/portfolio\/?$/, "") + "admin/";

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("admin_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

const ok = (r) => r.data;

// ── Auth ────────────────────────────────────────────────────────────────────
export const adminLogin = (password) => api.post("login", { password }).then(ok);

// ── Profile ─────────────────────────────────────────────────────────────────
export const getProfile = () => api.get("profile").then(ok);
export const updateProfile = (data) => api.put("profile", data).then(ok);

// ── Skills ──────────────────────────────────────────────────────────────────
export const getSkills = () => api.get("skills").then(ok);
export const createSkill = (data) => api.post("skills", data).then(ok);
export const updateSkill = (id, data) => api.put(`skills/${id}`, data).then(ok);
export const deleteSkill = (id) => api.delete(`skills/${id}`).then(ok);

// ── Projects ────────────────────────────────────────────────────────────────
export const getProjects = () => api.get("projects").then(ok);
export const createProject = (data) => api.post("projects", data).then(ok);
export const updateProject = (id, data) => api.put(`projects/${id}`, data).then(ok);
export const deleteProject = (id) => api.delete(`projects/${id}`).then(ok);

// ── Experience ──────────────────────────────────────────────────────────────
export const getExperience = () => api.get("experience").then(ok);
export const createExperience = (data) => api.post("experience", data).then(ok);
export const updateExperience = (id, data) => api.put(`experience/${id}`, data).then(ok);
export const deleteExperience = (id) => api.delete(`experience/${id}`).then(ok);

// ── Education ────────────────────────────────────────────────────────────────
export const getEducation = () => api.get("education").then(ok);
export const createEducation = (data) => api.post("education", data).then(ok);
export const updateEducation = (id, data) => api.put(`education/${id}`, data).then(ok);
export const deleteEducation = (id) => api.delete(`education/${id}`).then(ok);

// ── Certifications ───────────────────────────────────────────────────────────
export const getCertifications = () => api.get("certifications").then(ok);
export const createCertification = (data) => api.post("certifications", data).then(ok);
export const updateCertification = (id, data) => api.put(`certifications/${id}`, data).then(ok);
export const deleteCertification = (id) => api.delete(`certifications/${id}`).then(ok);

// ── Messages ─────────────────────────────────────────────────────────────────
export const getMessages = () => api.get("messages").then(ok);
export const deleteMessage = (id) => api.delete(`messages/${id}`).then(ok);
export const markMessageRead = (id) => api.patch(`messages/${id}/read`).then(ok);

// ── Site Settings ────────────────────────────────────────────────────────────
export const getSettings = () => api.get("settings").then(ok);
export const updateSettings = (data) => api.put("settings", data).then(ok);

// ── Blog ─────────────────────────────────────────────────────────────────────
export const getBlogPosts = () => api.get("blog").then(ok);
export const createBlogPost = (data) => api.post("blog", data).then(ok);
export const updateBlogPost = (id, data) => api.put(`blog/${id}`, data).then(ok);
export const deleteBlogPost = (id) => api.delete(`blog/${id}`).then(ok);
