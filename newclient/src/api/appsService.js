import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "/api/v1/"}`.replace(/portfolio\/?$/, "") + "apps/",
  timeout: 20000,
});

const ok = (r) => r.data;

export const resumeLogin = (password) => api.post("resume/login", { password }).then(ok);
export const optionLogin = (password) => api.post("option/login", { password }).then(ok);
