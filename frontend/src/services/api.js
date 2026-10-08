import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL, withCredentials: true });

// Access token lives in memory only (not localStorage) so XSS can't read a long-lived credential.
let accessToken = null;
let onAuthLost = () => {};
export const setAccessToken = (t) => { accessToken = t; };
export const setAuthLostHandler = (fn) => { onAuthLost = fn; };

api.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

let refreshing = null; // de-duplicates simultaneous refreshes
api.interceptors.response.use((r) => r, async (err) => {
  const { config, response } = err;
  if (response?.status === 401 && config && !config._retry && !config.url.startsWith('/auth/')) {
    config._retry = true;
    try {
      refreshing ||= axios.post(`${baseURL}/auth/refresh`, null, { withCredentials: true }).finally(() => { refreshing = null; });
      const { data } = await refreshing;
      accessToken = data.accessToken;
      return api(config);
    } catch {
      accessToken = null;
      onAuthLost();
    }
  }
  return Promise.reject(err);
});

export const errMsg = (e) => e.response?.data?.message || (e.request ? 'Cannot reach the server' : 'Something went wrong');

export const authApi = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};
export const questApi = {
  list: (params) => api.get('/quests', { params }),
  create: (d) => api.post('/quests', d),
  update: (id, d) => api.patch(`/quests/${id}`, d),
  remove: (id) => api.delete(`/quests/${id}`),
  complete: (id) => api.post(`/quests/${id}/complete`),
};
export const habitApi = {
  list: () => api.get('/habits'),
  create: (d) => api.post('/habits', d),
  update: (id, d) => api.patch(`/habits/${id}`, d),
  remove: (id) => api.delete(`/habits/${id}`),
  complete: (id) => api.post(`/habits/${id}/complete`),
};
export const statsApi = {
  dashboard: () => api.get('/dashboard'),
  activity: (params) => api.get('/activity', { params }),
};
export const userApi = {
  update: (d) => api.patch('/users/me', d),
  password: (d) => api.patch('/users/me/password', d),
  remove: (password) => api.delete('/users/me', { data: { password } }),
};
