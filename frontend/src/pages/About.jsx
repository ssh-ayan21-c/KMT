import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

export default function About() {
  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          <span className="text-gradient">ABOUT</span> KAMRAN MEKRANI TRADE
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          Premium automotive parts wholesale and distribution since 1998. 
          We specialize in high-performance engine components and electrical systems.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Contact Information Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Phone size={24} color="var(--accent-primary)" /> Contact Administration
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 90, 9, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} color="var(--accent-primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mobile Number</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>+91 87953 73845</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 90, 9, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} color="var(--accent-primary)" />
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>mekranikamran@gmail.com</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 90, 9, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} color="var(--accent-primary)" />
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operating Location</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Noida Sector 71, Delhi NCR, India</div>
                </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Note for Buyers:</strong> Our administrative team is available for inquiries from Monday to Saturday, 10:00 AM to 7:00 PM IST.
          </div>
        </div>

        {/* Brand Values / Trust Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <ShieldCheck size={24} color="var(--accent-primary)" /> Our Commitment
           </h2>

           <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <Clock size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                 <div>
                    <div style={{ fontWeight: 600 }}>Rapid Logistics</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Same-day dispatch for local inventory and expedited international shipping options.</p>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                 <Award size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                 <div>
                    <div style={{ fontWeight: 600 }}>Quality Assured</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Every component in our catalog undergoes rigorous quality checks before listing.</p>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                 <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                 <div>
                    <div style={{ fontWeight: 600 }}>Secure Transactions</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>All financial interactions and orders are processed through highly secure channels.</p>
                 </div>
              </div>
           </div>

           <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '2rem' }}>
              <img src="/logo.png" alt="KMT Logo" style={{ height: '50px', opacity: 0.3, filter: 'invert(1)' }} />
           </div>
        </div>
      </div>
    </div>
  );
}
