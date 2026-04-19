import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    
    login: async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            set({ user: res.data.user, token: res.data.token });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    },

    register: async (name, email, password, phoneNumber) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, phoneNumber });
            set({ user: res.data.user, token: res.data.token });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
    },
    
    logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    },
    
    initialize: async () => {
         const token = localStorage.getItem('token');
         if (token) {
             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
             try {
                  const res = await axios.get('http://localhost:5000/api/auth/me');
                  set({ token, user: res.data.user });
             } catch(err) {
                  localStorage.removeItem('token');
                  delete axios.defaults.headers.common['Authorization'];
                  set({ token: null, user: null });
             }
         }
    }
}));

export default useAuthStore;
