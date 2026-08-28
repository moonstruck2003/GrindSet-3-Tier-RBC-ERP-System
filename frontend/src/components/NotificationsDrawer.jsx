import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, X, ShieldAlert, Building2, UserPlus, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../config/api';

export default function NotificationsDrawer({ isOpen, onClose, user, lightMode }) {
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const companyId = user?.userId || 1;
      Promise.all([
        user?.role === 'Admin' ? api.pendingCompanies().catch(() => []) : Promise.resolve([]),
        user?.role === 'Company' ? api.pendingEmployees(companyId).catch(() => []) : Promise.resolve([]),
        api.accounts().catch(() => []),
      ]).then(([pc, pe, accs]) => {
        setPendingCompanies(pc);
        setPendingEmployees(pe);
        const overruns = accs.filter(a => a.currentBalance < 0);
        setBudgetAlerts(overruns);
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const sectionBg = lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.03)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          width: '100%', maxWidth: 400, height: '100vh', background: cardBg,
          borderLeft: `1px solid ${border}`, boxShadow: '-10px 0 30px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell style={{ width: 18, height: 18, color: '#4C9AFF' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Notification Center</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Body Items */}
        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Pending Company Approvals (Admin) */}
          {user?.role === 'Admin' && pendingCompanies.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#FFAB00', marginBottom: 8 }}>
                Pending Tenant Registrations ({pendingCompanies.length})
              </div>
              {pendingCompanies.map(c => (
                <div key={c.companyId} style={{ padding: 12, borderRadius: 12, background: sectionBg, border: `1px solid ${border}`, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: textPri }}>{c.companyName}</div>
                  <div style={{ fontSize: 11, color: textMut, marginTop: 2 }}>Reg: {c.registrationNo} &nbsp;·&nbsp; {c.email}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button
                      onClick={async () => {
                        await api.approveCompany(c.companyId);
                        setPendingCompanies(prev => prev.filter(x => x.companyId !== c.companyId));
                      }}
                      style={{ padding: '4px 10px', borderRadius: 6, background: '#36B37E', color: 'white', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Employee Applications (Company) */}
          {user?.role === 'Company' && pendingEmployees.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#FFAB00', marginBottom: 8 }}>
                Employee Signup Applications ({pendingEmployees.length})
              </div>
              {pendingEmployees.map(e => (
                <div key={e.EmployeeId} style={{ padding: 12, borderRadius: 12, background: sectionBg, border: `1px solid ${border}`, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: textPri }}>{e.FullName}</div>
                  <div style={{ fontSize: 11, color: textMut, marginTop: 2 }}>{e.Designation} &nbsp;·&nbsp; {e.Email}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button
                      onClick={async () => {
                        await api.approveEmployee(e.EmployeeId);
                        setPendingEmployees(prev => prev.filter(x => x.EmployeeId !== e.EmployeeId));
                      }}
                      style={{ padding: '4px 10px', borderRadius: 6, background: '#36B37E', color: 'white', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}
                    >
                      Approve Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Budget Overrun Alerts */}
          {budgetAlerts.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#FF8F73', marginBottom: 8 }}>
                Budget Overrun Alerts ({budgetAlerts.length})
              </div>
              {budgetAlerts.map(b => (
                <div key={b.accountId} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,86,48,0.1)', border: '1px solid rgba(255,86,48,0.2)', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#FF8F73' }}>{b.accountName}</div>
                  <div style={{ fontSize: 11, color: textMut, marginTop: 2 }}>Current Balance: ${b.currentBalance?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          {pendingCompanies.length === 0 && pendingEmployees.length === 0 && budgetAlerts.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: textMut, fontSize: 13 }}>
              <CheckCircle2 style={{ width: 28, height: 28, color: '#36B37E', margin: '0 auto 8px' }} />
              All notifications cleared! System healthy.
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
