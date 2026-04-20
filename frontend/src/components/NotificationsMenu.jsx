import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useAuthStore, { api } from '../store/authStore';
import { Bell, Info, MailOpen, ShieldCheck, XCircle } from 'lucide-react';

export default function NotificationsMenu() {
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchNotifications = async () => {
         try {
             const res = await api.get('/notifications');
             setNotifications(res.data);
         } catch(err) { console.error('Failed to fetch notifications'); }
    }

    useEffect(() => {
         fetchNotifications();
         const interval = setInterval(fetchNotifications, 10000); 
         return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
         try {
             await api.put(`/notifications/${id}/read`);
             setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
         } catch(err) {}
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const modalContent = showModal && (
        <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.85)' }} 
            onClick={() => setShowModal(false)}
        >
            <div 
                style={{ width: '90%', maxWidth: '500px', maxHeight: '85vh', background: '#2a2a2a', border: '1px solid var(--border-color)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column' }} 
                onClick={e => e.stopPropagation()}
            >
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 90, 9, 0.1)' }}>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.4rem' }}>Notification Center</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You have {unreadCount} unread communications</p>
                        </div>
                        <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                            <XCircle size={24} />
                        </button>
                    </div>
                    
                    <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                <Bell size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                                <div style={{ color: 'var(--text-secondary)' }}>No transmission history found.</div>
                            </div>
                        ) : notifications.map(notif => (
                            <div key={notif._id} style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: notif.read ? 'transparent' : 'rgba(255, 90, 9, 0.03)', cursor: 'pointer', display: 'flex', gap: '1.25rem', transition: 'var(--transition)', borderRadius: '12px', marginBottom: '0.5rem' }} onClick={() => { if(!notif.read) markAsRead(notif._id) }}>
                                
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: notif.read ? 'var(--bg-primary)' : 'rgba(255, 90, 9, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {notif.type === 'access_granted' ? <ShieldCheck size={20} color="var(--accent-green)"/> :
                                    notif.type === 'order_status' ? <Info size={20} color="var(--accent-primary)"/> :
                                    notif.type === 'order_request' ? <MailOpen size={20} color="var(--accent-secondary)"/> :
                                    <Bell size={20} color="var(--text-secondary)" />}
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', lineHeight: 1.5, color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{notif.message.replace('$', '₹')}</p>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--border-color)', fontWeight: 600 }}>{new Date(notif.createdAt).toLocaleString()}</div>
                                </div>
                                
                                {!notif.read && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)', marginTop: '0.25rem' }} />}
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Proprietary communication log of Kamran Mekrani Trade (KMT)
                    </div>
            </div>
        </div>
    );

    return (
         <>
              <button 
                  className="btn btn-glass" 
                  style={{ padding: '0.6rem', position: 'relative', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
                  onClick={() => setShowModal(true)}
              >
                  <Bell size={20} color={unreadCount > 0 ? 'var(--accent-primary)' : 'white'} />
                  {unreadCount > 0 && (
                      <div style={{ position: 'absolute', top: -5, right: -5, background: 'var(--accent-primary)', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid var(--bg-primary)' }}>
                           {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                  )}
              </button>

              {showModal && createPortal(modalContent, document.body)}
         </>
    );
}
