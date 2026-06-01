import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  companyName?: string;
  taxId?: string;
  companyAddress?: string;
  businessLicense?: string[];
  portfolio?: string[];
  bio?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;

  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  register: (data: Partial<User>) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      login: async (email: string, password: string, role: UserRole = 'customer') => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;

          set({
            user,
            role: user.role,
            isAuthenticated: true,
            token,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', {
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: data.role || 'customer'
          });

          const { user } = response.data;
          set({
            user: {
              ...user,
              createdAt: new Date().toISOString(),
            },
            role: user.role,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          role: null,
          isAuthenticated: false,
          token: null,
        });
        localStorage.removeItem('authStore');
      },

      updateProfile: async (data: Partial<User>) => {
        const current = get().user;
        if (!current) return;

        set({ isLoading: true });
        try {
          const response = await api.patch('/auth/profile', {
            name: data.name,
            phone: data.phone,
            avatar: data.avatar,
            dateOfBirth: data.dateOfBirth,
            address: data.address
          });

          const updated = { ...current, ...response.data.user };
          set({ user: updated, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          role: user?.role || null,
          isAuthenticated: !!user,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'authStore',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);
