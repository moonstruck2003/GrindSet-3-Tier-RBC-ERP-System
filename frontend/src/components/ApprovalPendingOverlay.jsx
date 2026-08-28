import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, LogOut, Lock, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../config/api';

export default function ApprovalPendingOverlay({ user, onRefreshSession, onSignOut, lightMode = false }) {
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState('');

  if (!user || user.approvalStatus === 'Approved') {
    return null;
  }

  const handleCheckStatus = async () => {
    setChecking(true);
    setCheckResult('');
    try {
      const updated = await api.me(user.userId);
      if (updated.approvalStatus === 'Approved') {
        localStorage.setItem('grindset_user', JSON.stringify({ ...user, ...updated }));
        setCheckResult('Approved! Unlocking interface...');
        setTimeout(() => {
          if (onRefreshSession) onRefreshSession(updated);
          window.location.reload();
        }, 600);
      } else {
        setCheckResult(`Current status: ${updated.approvalStatus}`);
        if (onRefreshSession) onRefreshSession(updated);
      }
    } catch {
      setCheckResult('Unable to verify status right now.');
    } finally {
      setChecking(false);
    }
  };

  const isCompany = user.role === 'Company';
  const isPendingAdmin = user.approvalStatus === 'PendingAdmin';
  const isPendingCompany = user.approvalStatus === 'PendingCompany';
  const isRejected = user.approvalStatus === 'Rejected';

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: lightMode ? 'rgba(240, 242, 245, 0.82)' : 'rgba(7, 15, 31, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          width: '100%',
          maxWidth: 520,
          background: cardBg,
          borderRadius: 24,
          border: `1px solid ${border}`,
          boxShadow: lightMode
            ? '0 20px 40px -15px rgba(9, 30, 66, 0.25), 0 0 0 1px rgba(9, 30, 66, 0.08)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          padding: 32,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Status Banner */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 20,
          background: isRejected ? 'rgba(255,86,48,0.14)' : 'rgba(255,171,0,0.14)',
          border: isRejected ? '1px solid rgba(255,86,48,0.3)' : '1px solid rgba(255,171,0,0.3)',
          color: isRejected ? '#FF5630' : '#FFAB00',
        }}>
          {isRejected ? <AlertTriangle style={{ width: 14, height: 14 }} /> : <Clock style={{ width: 14, height: 14 }} />}
          {isRejected ? 'Access Restricted' : 'Jira Security Verification'}
        </div>

        {/* Big Icon */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          margin: '0 auto 20px',
          background: isRejected
            ? 'linear-gradient(135deg, #FF5630, #DE350B)'
            : 'linear-gradient(135deg, #FFAB00, #FF8F73)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isRejected ? '0 10px 25px rgba(255,86,48,0.35)' : '0 10px 25px rgba(255,171,0,0.35)',
        }}>
          {isRejected ? <ShieldAlert style={{ width: 36, height: 36, color: 'white' }} /> : <Lock style={{ width: 36, height: 36, color: 'white' }} />}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: textPri, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          {isRejected && 'Account Registration Rejected'}
          {!isRejected && isPendingAdmin && 'Pending Admin Approval'}
          {!isRejected && isPendingCompany && 'Pending Employer Approval'}
        </h2>

        {/* Subtitle / Description */}
        <p style={{ fontSize: 13, lineHeight: 1.6, color: textMut, margin: '0 0 24px' }}>
          {isRejected && (
            `Your account application for ${user.fullName} (${user.email}) was declined by system security administrators.`
          )}
          {!isRejected && isCompany && (
            <>
              Your company account <strong>"{user.fullName}"</strong> has been registered successfully. To protect enterprise data integrity, System Administrators must review and approve your registration before full portal features are activated.
            </>
          )}
          {!isRejected && !isCompany && (
            <>
              Your employee account <strong>"{user.fullName}"</strong> has been registered. Your company manager/administrator must review and approve your profile before your workspace access is activated.
            </>
          )}
        </p>

        {/* Account Info Chip */}
        <div style={{
          padding: '12px 16px',
          borderRadius: 14,
          background: lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          fontSize: 12,
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: textPri }}>{user.fullName || user.email}</div>
            <div style={{ color: textMut, fontSize: 11 }}>Role: {user.role} &nbsp;·&nbsp; ID: #{user.userId}</div>
          </div>
          <span style={{
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            background: 'rgba(255,171,0,0.15)',
            color: '#FFAB00',
            border: '1px solid rgba(255,171,0,0.3)',
          }}>
            {user.approvalStatus}
          </span>
        </div>

        {/* Check Result status alert */}
        {checkResult && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 20,
            background: checkResult.includes('Approved') ? 'rgba(54,179,126,0.15)' : 'rgba(0,82,204,0.15)',
            color: checkResult.includes('Approved') ? '#36B37E' : '#4C9AFF',
            border: checkResult.includes('Approved') ? '1px solid rgba(54,179,126,0.3)' : '1px solid rgba(0,82,204,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            {checkResult.includes('Approved') ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <Clock style={{ width: 14, height: 14 }} />}
            {checkResult}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0065FF, #0052CC)',
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              border: 'none',
              cursor: checking ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 15px rgba(0,82,204,0.35)',
            }}
          >
            <RefreshCw style={{ width: 15, height: 15, animation: checking ? 'spin 1s linear infinite' : 'none' }} />
            {checking ? 'Checking Status...' : 'Check Approval Status'}
          </button>

          <button
            onClick={onSignOut}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              background: lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${border}`,
              color: textPri,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
