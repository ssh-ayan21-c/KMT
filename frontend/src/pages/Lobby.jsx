import React, { useState, useEffect } from 'react';
import useAuthStore, { api } from '../store/authStore';
import { PackageSearch, LogOut } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Lobby() {
    const { user, logout } = useAuthStore();
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState([]);
    const [requested, setRequested] = useState(false);
    const [loading, setLoading] = useState(true);

    if (user?.role === 'admin') return <Navigate to="/admin" replace />;

    useEffect(() => {
         const fetchCategories = async () => {
             try {
                 const res = await api.get('/categories');
                 const allCats = res.data;
                 // Don't show categories they are already approved for
                 const validCats = user?.approvedCategories?.length > 0 
                     ? allCats.filter(c => !user.approvedCategories.some(ac => ac._id === c._id || ac === c._id))
                     : allCats;
                 setCategories(validCats);
             } catch(err) {
                 console.error(err);
             } finally {
                 setLoading(false);
             }
         }
         fetchCategories();
    }, [user]);

    const toggleSelection = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    }

    const requestAccess = async () => {
        if (selected.length === 0) return alert('Please select at least one category to request access for.');
        
        try {
            await api.post('/auth/request-access', { categories: selected });
            setRequested(true);
        } catch(err) {
            alert('Failed to submit request');
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '1rem', height: 'auto', minHeight: '100vh' }}>
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
                 <button className="btn btn-glass" onClick={logout}>
                     <LogOut size={16} /> Logout
                 </button>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', width: '100%', margin: '4rem 0' }}>
                <img src="/logo.png" alt="KMT Logo" style={{ height: '80px', filter: 'invert(1)', marginBottom: '2rem' }} />
                <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Welcome to <span className="text-gradient">KMT Trade</span></h1>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    Hello {user?.name}. Your business profile is currently pending validation for our secure environment.
                    Please select macro-categories to request wholesale access.
                </p>
                
                {loading ? <div style={{ color: 'var(--text-secondary)' }}>Verifying credentials...</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                        {categories.map(cat => {
                             const isSelected = selected.includes(cat._id);
                             return (
                                 <div 
                                      key={cat._id}
                                      className="glass-panel" 
                                      onClick={() => toggleSelection(cat._id)}
                                      style={{ 
                                          padding: '0.75rem', 
                                          cursor: 'pointer',
                                          fontSize: '0.9rem',
                                          transition: 'all 0.2s ease',
                                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                          background: isSelected ? 'rgba(255, 90, 9, 0.1)' : 'var(--bg-glass)'
                                      }}
                                  >
                                      {cat.name}
                                  </div>
                             )
                        })}
                        {categories.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No trading blocks available.</div>}
                    </div>
                )}

                {!requested ? (
                    <button className="btn btn-primary" onClick={requestAccess} style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', width: '100%', justifyContent: 'center' }}>
                        Request Access
                    </button>
                ) : (
                    <div style={{ color: 'var(--accent-green)', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid var(--accent-green)' }}>
                        ✓ Request Logged.
                    </div>
                )}
            </div>
        </div>
    );
}
