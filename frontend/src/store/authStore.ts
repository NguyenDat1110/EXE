import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { findMockUser, MOCK_USERS } from '../lib/mockData';
import api from '../services/api';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  companyName?: string;
  taxId?: string;
  companyAddress?: string;
  businessLicense?: string;
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
          // Attempt real API login
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;

          set({
            user,
            role: user.role,
            isAuthenticated: true,
            token,
            isLoading: false,
          });
        } catch (error: any) {
          // Network Error or Server offline fallback to mock login
          const isNetworkError = error.message === 'Network Error' || !error.response;

          if (isNetworkError) {
            const mockUser = findMockUser(email, password);
            if (mockUser) {
              const user: User = {
                id: `user_${Date.now()}`,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
                avatar: mockUser.avatar,
                phone: mockUser.phone,
                dateOfBirth: mockUser.dateOfBirth,
                address: mockUser.address,
                city: mockUser.city,
                companyName: mockUser.companyName,
                taxId: mockUser.taxId,
                companyAddress: mockUser.companyAddress,
                businessLicense: mockUser.businessLicense,
                bio: mockUser.bio,
                portfolio: [],
                createdAt: new Date().toISOString(),
              };

              set({
                user,
                role: user.role,
                isAuthenticated: true,
                token: 'mock-token-' + Date.now(),
                isLoading: false,
              });
              return;
            } else {
              const genericUser: User = {
                id: `user_${Date.now()}`,
                email,
                name: email.split('@')[0],
                role,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                createdAt: new Date().toISOString(),
              };

              set({
                user: genericUser,
                role,
                isAuthenticated: true,
                token: 'mock-token-' + Date.now(),
                isLoading: false,
              });
              return;
            }
          }

          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          // Mock registration delay
          await new Promise(resolve => setTimeout(resolve, 2000));

          const newUser: User = {
            id: `user_${Date.now()}`,
            email: data.email || '',
            name: data.name || '',
            role: data.role || 'customer',
            avatar: data.avatar,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            address: data.address,
            city: data.city,
            companyName: data.companyName,
            taxId: data.taxId,
            companyAddress: data.companyAddress,
            businessLicense: data.businessLicense,
            portfolio: data.portfolio,
            bio: data.bio,
            createdAt: new Date().toISOString(),
          };

          set({
            user: newUser,
            role: newUser.role,
            isAuthenticated: true,
            token: 'mock-token-' + Date.now(),
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

        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const updated = { ...current, ...data };
          set({ user: updated });
        } catch (error) {
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
