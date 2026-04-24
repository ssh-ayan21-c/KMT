import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore, { api } from '../store/authStore';
import { LayoutDashboard, Package, ShieldCheck, LogOut, XCircle, PackageSearch, MessageSquare, Info } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuthStore();
    
    return (
        <aside 
            className={`glass-panel sidebar-mobile ${isOpen ? 'open' : ''}`} 
            style={{ width: '280px', margin: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
            <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <img src="/logo.png" alt="KMT Logo" style={{ height: '60px', filter: 'invert(1)' }} />
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.1em' }}><span className="text-gradient">KAMRAN MEKRANI</span></h2>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Trade Portal</div>
                </div>
            </div>
            
            <nav style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '0.5rem', letterSpacing: '0.05em', fontWeight: 'bold' }}>Navigation</div>
                
                <NavLink to="/about" onClick={onClose} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                    {({ isActive }) => (
                        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: isActive ? 'rgba(255, 90, 9, 0.15)' : 'transparent', color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                            <Info size={18} /> About KMT
                        </div>
                    )}
                </NavLink>
                
                {user?.role === 'admin' && (
                    <NavLink to="/admin" onClick={onClose} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                        {({ isActive }) => (
                            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: isActive ? 'rgba(255, 90, 9, 0.15)' : 'transparent', color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                                <LayoutDashboard size={18} /> Sales Control
                            </div>
                        )}
                    </NavLink>
                )}

                {user?.role === 'buyer' && (
                    <>
                        {user?.isApproved && (
                             <NavLink to="/catalog" onClick={onClose} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                                  {({ isActive }) => (
                                      <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: isActive ? 'rgba(255, 90, 9, 0.15)' : 'transparent', color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                                             <Package size={18} /> Browse Catalog
                                      </div>
                                  )}
                             </NavLink>
                        )}
                        
                        <NavLink to="/discover" onClick={onClose} style={{ textDecoration: 'none', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                             {({ isActive }) => (
                                 <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: isActive ? 'rgba(255, 90, 9, 0.15)' : 'transparent', color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                                        <PackageSearch size={18} /> Request Access
                                 </div>
                             )}
                        </NavLink>

                        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginTop: '0.5rem' }} onClick={() => {
                             const suggestion = prompt("Submit a feature or product suggestion directly to Kamran Mekrani Trade administration:");
                             if (suggestion) {
                                 api.post('/notifications/suggest', { suggestion }).then(() => alert("Suggestion submitted successfully!"));
                             }
                             onClose();
                        }}>
                             <MessageSquare size={18} /> Drop Suggestion
                        </div>

                        {user?.isApproved && (
                           <>
                             <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '1.5rem 0 0.5rem 0', letterSpacing: '0.05em' }}>My Categories</div>
                             {user.approvedCategories?.map(cat => (
                                 <NavLink key={cat._id} to={`/catalog/${cat._id}`} onClick={onClose} style={{ textDecoration: 'none', color: 'inherit' }}>
                                      {({ isActive }) => (
                                           <div style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'var(--transition)' }} 
                                                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'white' }} 
                                                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)' }}>
                                               • {cat.name}
                                           </div>
                                      )}
                                 </NavLink>
                             ))}
                           </>
                        )}
                    </>
                )}

            </nav>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                          <ShieldCheck size={20} color={'var(--accent-primary)'} />
                      </div>
                      <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.role === 'admin' ? 'KMT Administrator' : 'Verified Buyer'}</div>
                      </div>
                 </div>
                 <button className="btn btn-glass" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }} onClick={logout}>
                     <LogOut size={16} /> Secure Logout
                 </button>
            </div>
        </aside>
    );
}
