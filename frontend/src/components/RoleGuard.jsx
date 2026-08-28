import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RoleGuard({ allowedRoles = [], children, lightMode = false }) {
  const navigate = useNavigate();

  let user = null;
  try {
    const raw = localStorage.getItem('grindset_user');
    if (raw) user = JSON.parse(raw);
  } catch {}

  const role = user?.role || 'Company';

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
    const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
    const textPri = lightMode ? '#091E42' : '#F4F5F7';
    const textMut = lightMode ? '#5E6C84' : '#8993A4';

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 20 }}>
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: '100%', maxWidth: 480, background: cardBg, borderRadius: 20,
            border: `1px solid ${border}`, padding: 32, textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,86,48,0.15)', color: '#FF5630', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock style={{ width: 32, height: 32 }} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: textPri, margin: '0 0 10px' }}>
            Access Restricted by Security Policy
          </h2>

          <p style={{ fontSize: 13, lineHeight: 1.6, color: textMut, margin: '0 0 24px' }}>
            This resource is restricted to authorized <strong>{allowedRoles.join(' / ')}</strong> accounts. Your current role is <strong>{role}</strong>.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
              style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} /> Return to My Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
