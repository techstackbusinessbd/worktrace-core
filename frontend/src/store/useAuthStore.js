import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Action: Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/login', { email, password });
          const { user, token, tenant_id } = response.data;
          
          set({
            user,
            token,
            tenant: tenant_id, // in this setup we might just get tenant_id from user
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          return false;
        }
      },

      // Action: Register Company
      registerCompany: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/register-company', formData);
          const { user, token, tenant, enrollment_token } = response.data;
          
          set({
            user,
            token,
            tenant: { ...tenant, enrollment_token },
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          return false;
        }
      },

      // Action: Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          // Attempt API logout if token exists
          if (get().token) {
            await api.post('/logout');
          }
        } catch {
          console.error("Logout API failed, clearing local state anyway.");
        } finally {
          set({
            user: null,
            token: null,
            tenant: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Action: clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);

export default useAuthStore;
