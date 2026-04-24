import { create } from 'zustand';
import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000 // 10 second timeout
});

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    
    login: async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ user, token });
            
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    },

    googleLogin: async (googleToken, phoneNumber = null) => {
        try {
            const res = await api.post('/auth/google-login', { googleToken, phoneNumber });
            const { token, user, needsPhone } = res.data;
            
            // Only finalize session if we don't need a phone number
            if (!needsPhone) {
                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            
            set({ user, token: needsPhone ? null : token });
            
            return { success: true, user, needsPhone };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Google Login failed' };
        }
    },

    register: async (name, email, password, phoneNumber) => {
        try {
            const res = await api.post('/auth/register', { name, email, password, phoneNumber });
            const { token, user } = res.data;
            
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ user, token });
            
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
    },

    resetPassword: async (email, phoneNumber, newPassword) => {
        try {
            const res = await api.post('/auth/reset-password', { email, phoneNumber, newPassword });
            return { success: true, message: res.data.message };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Password reset failed' };
        }
    },
    
    logout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
    },
    
    initialize: async () => {
         const token = localStorage.getItem('token');
         if (!token) {
             set({ token: null, user: null });
             return;
         }

         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
         try {
              const res = await api.get('/auth/me');
              set({ token, user: res.data.user });
         } catch(err) {
              console.error("Auth initialization failed:", err);
              localStorage.removeItem('token');
              delete api.defaults.headers.common['Authorization'];
              set({ token: null, user: null });
         }
    }
}));

export { api };
export default useAuthStore;
