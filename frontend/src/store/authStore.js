import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, loading: false });
      return { success: true, user };
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed';
      set({ error, loading: false });
      return { success: false, error };
    }
  },

  register: async (email, password, role) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { email, password, role });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, loading: false });
      return { success: true, user };
    } catch (err) {
      const error = err.response?.data?.error || 'Registration failed';
      set({ error, loading: false });
      return { success: false, error };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));

export default useAuthStore;