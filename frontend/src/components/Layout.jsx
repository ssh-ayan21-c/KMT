import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationsMenu from './NotificationsMenu';
import { Menu, X } from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1999, backdropFilter: 'blur(4px)' }} 
          className="mobile-only"
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
           <header className="header-mobile" style={{ height: '70px', padding: '0 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'rgba(26, 26, 26, 0.4)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src="/logo.png" alt="KMT Logo" style={{ height: '30px', filter: 'invert(1)' }} className="mobile-only" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em' }} className="desktop-only">KAMRAN MEKRANI TRADE (KMT) • SECURE WHOLESALE ENVIRONMENT</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <NotificationsMenu />
                    <button 
                        className="btn btn-glass mobile-only" 
                        style={{ padding: '0.5rem', borderRadius: '50%' }}
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
           </header>
           
           <main className="main-content-mobile" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              <div style={{ maxWidth: '1400px', margin: '0 auto', height: '100%' }}>
                  <Outlet />
              </div>
           </main>
      </div>
    </div>
  );
}
