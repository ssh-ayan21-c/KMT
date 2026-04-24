import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { LogIn, UserPlus, Phone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password mode
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Post-Google login phone number logic
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(null);
  
  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { login, register, googleLogin, resetPassword } = useAuthStore();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    let res;
    
    if (isLogin) {
        res = await login(email, password);
    } else {
        res = await register(name, email, password, phoneNumber);
    }
    
    if (!res.success) setError(res.error);
  };

  const handleResetPassword = async (e) => {
      e.preventDefault();
      setError('');
      setSuccessMsg('');
      const res = await resetPassword(email, phoneNumber, password); // Using password var as newPassword
      if (res.success) {
          setSuccessMsg(res.message);
          setIsForgotPassword(false);
          setIsLogin(true);
      } else {
          setError(res.error);
      }
  };

  const onGoogleSuccess = async (response) => {
      setGoogleIdToken(response.credential);
      const res = await googleLogin(response.credential);
      if (res.success) {
          if (res.needsPhone) {
              setShowPhoneModal(true);
          }
      } else {
          setError(res.error);
      }
  };

  const submitPhoneNumber = async () => {
       if (!phoneNumber) return;
       setError('');
       const res = await googleLogin(googleIdToken, phoneNumber);
       if (res.success && !res.needsPhone) {
           setShowPhoneModal(false);
       } else {
           setError('Failed to finalize account. Please try again.');
       }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #393939 0%, #1a1a1a 100%)', padding: '1rem', height: 'auto', minHeight: '100vh' }}>
      
      {showPhoneModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                  <div style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}><Phone size={48} /></div>
                  <h3 style={{ marginBottom: '0.5rem' }}>One last step!</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>We need your phone number for order communications and delivery coordination.</p>
                  <input 
                    type="tel" 
                    className="input-glass" 
                    style={{ width: '100%', marginBottom: '1.5rem' }} 
                    placeholder="+91 XXXXX XXXXX"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                  />
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submitPhoneNumber}>Get Started</button>
              </div>
          </div>
      )}

      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: '32px', background: 'rgba(57, 57, 57, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="KMT Logo" style={{ height: '80px', filter: 'invert(1)', marginBottom: '1.5rem' }} />
            <h2 style={{ margin: '0', fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>KAMRAN MEKRANI TRADE</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Premium B2B Wholesale Gateway</p>
        </div>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign:'center', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        {successMsg && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign:'center', fontSize: '0.9rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{successMsg}</div>}
        
        {isForgotPassword ? (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Enter your account details to reset your password.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email Address</label>
                    <input type="email" className="input-glass" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@company.com" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Registered Phone Number</label>
                    <input type="tel" className="input-glass" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required placeholder="+91 XXXXX XXXXX" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>New Security Password</label>
                    <input type="password" className="input-glass" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem', padding: '1rem', borderRadius: '12px', fontSize: '1rem' }}>
                    Reset Password
                </button>
            </form>
        ) : (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Security Password</label>
                    {isLogin && (
                        <span onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }} style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>Forgot Password?</span>
                    )}
                </div>
                <input type="password" className="input-glass" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>

              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem', padding: '1rem', borderRadius: '12px', fontSize: '1rem' }}>
                {isLogin ? <><LogIn size={20} /> Authorize Access</> : <><UserPlus size={20} /> Register Account</>}
              </button>
            </form>
        )}

        {!isForgotPassword && hasGoogleClientId && (
            <>
                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin 
                        onSuccess={onGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        theme="filled_black"
                        shape="pill"
                        text="continue_with"
                        width={300}
                    />
                </div>
            </>
        )}

        {!isForgotPassword && !hasGoogleClientId && (
             <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                 Secure internal credentials required.
             </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
           <button 
              onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); setError(''); setSuccessMsg(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-secondary)'}
            >
              {isForgotPassword ? "Back to Login Portal" : (isLogin ? "Prospective Buyer? Apply for an Account" : "Registered Partner? Sign In Here")}
           </button>
        </div>
      </div>
    </div>
  );
}
