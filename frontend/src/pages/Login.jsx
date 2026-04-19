import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useAuthStore();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    let res;
    
    if (isLogin) {
        res = await login(email, password);
    } else {
        res = await register(name, email, password, phoneNumber);
    }
    
    if (!res.success) setError(res.error);
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #393939 0%, #1a1a1a 100%)', padding: '1rem', height: 'auto', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: '32px', background: 'rgba(57, 57, 57, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="KMT Logo" style={{ height: '80px', filter: 'invert(1)', marginBottom: '1.5rem' }} />
            <h2 style={{ margin: '0', fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>KAMRAN MEKRANI TRADE</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Premium B2B Wholesale Gateway</p>
        </div>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign:'center', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Full Name / Business Entity</label>
                    <input type="text" className="input-glass" value={name} onChange={e => setName(e.target.value)} required={!isLogin} placeholder="Enter your business name" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Phone Number</label>
                    <input type="tel" className="input-glass" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required={!isLogin} placeholder="+91 XXXXX XXXXX" />
                </div>
              </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Business Email Address</label>
            <input type="email" className="input-glass" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@company.com" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Security Password</label>
            <input type="password" className="input-glass" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem', padding: '1rem', borderRadius: '12px', fontSize: '1rem' }}>
            {isLogin ? <><LogIn size={20} /> Authorize Access</> : <><UserPlus size={20} /> Register Account</>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
           <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-secondary)'}
            >
              {isLogin ? "Prospective Buyer? Apply for an Account" : "Registered Partner? Sign In Here"}
           </button>
        </div>
      </div>
    </div>
  );
}
