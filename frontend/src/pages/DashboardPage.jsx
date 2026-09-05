import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, FolderKanban, Coins, ShieldAlert, TrendingUp,
  ChevronRight, AlertTriangle, Database, Zap, CheckCircle2, XCircle, Building2, UserPlus
} from 'lucide-react';
import { api } from '../config/api';
import { useTheme } from '../config/theme';

function SparkLine({ data, color }) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 280},${60 - (v / max) * 52}`).join(' ');
  return (
    <svg viewBox="0 0 280 64" style={{ width: '100%', height: 56 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#sg-${color.replace('#', '')})`} points={`0,64 ${pts} 280,64`} />
      <polyline fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

const SPRINT = [30, 45, 62, 58, 78, 85, 76, 90];
const BUDGET = [20, 35, 55, 48, 65, 72, 68, 80];

function StatCard({ label, value, icon: Icon, color, sub, delay, T }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay }}
      whileHover={{ y: -4, boxShadow: `0 16px 48px ${color}20` }}
      style={{
        background: T.cardBg, border: `1px solid ${T.cardBdr}`,
        borderTop: `3px solid ${color}`, borderRadius: 16,
        padding: '20px 22px', backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: T.textMut, marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 30, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value ?? '—'}</p>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 20, height: 20, color }} />
        </div>
      </div>
      {sub && <p style={{ fontSize: 12, color: T.textMut, margin: 0 }}>{sub}</p>}
    </motion.div>
  );
}

export default function DashboardPage({ lightMode }) {
  const T = useTheme(lightMode);
  const [currentUser, setCurrentUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [txns, setTxns] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    let u = null;
    try {
      const raw = localStorage.getItem('grindset_user');
      if (raw) u = JSON.parse(raw);
    } catch {}
    setCurrentUser(u);

    const companyId = u?.companyId || u?.userId;

    Promise.all([
      api.erdSummary().catch(() => null),
      api.projects().catch(() => []),
      api.transactions().catch(() => []),
      companyId ? api.pendingEmployees(companyId).catch(() => []) : Promise.resolve([]),
    ])
      .then(([s, p, t, pe]) => {
        setSummary(s);
        setProjects(p);
        setTxns(t.slice(0, 6));
        setPendingEmployees(pe);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApproveEmployee = async (empId) => {
    try {
      await api.approveEmployee(empId);
      setActionMsg(`Employee #${empId} approved successfully!`);
      setTimeout(() => setActionMsg(''), 4000);
      const companyId = currentUser?.companyId || currentUser?.userId;
      const pe = companyId ? await api.pendingEmployees(companyId).catch(() => []) : [];
      setPendingEmployees(pe);
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectEmployee = async (empId) => {
    if (!window.confirm('Are you sure you want to reject this employee application?')) return;
    try {
      await api.rejectEmployee(empId);
      setActionMsg(`Employee #${empId} request rejected.`);
      setTimeout(() => setActionMsg(''), 4000);
      const companyId = currentUser?.companyId || currentUser?.userId;
      const pe = companyId ? await api.pendingEmployees(companyId).catch(() => []) : [];
      setPendingEmployees(pe);
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  const WEEKS = ['W1','W2','W3','W4','W5','W6','W7','W8'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: T.textPri, margin: 0 }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg,#4C9AFF,#0052CC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{currentUser?.fullName || 'Company Owner'}</span> 👋
          </h2>
          <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>Enterprise Organization Overview & Workforce Management Portal</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 20,
          background: 'rgba(0,82,204,0.12)', border: '1px solid rgba(0,82,204,0.25)',
          fontSize: 11, fontWeight: 700, color: '#4C9AFF', fontFamily: 'JetBrains Mono, monospace' }}>
          <Building2 style={{ width: 13, height: 13 }} />
          Company Tenant Tier
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(54,179,126,0.15)', border: '1px solid rgba(54,179,126,0.3)', color: '#57D9A3', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          {actionMsg}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total Workforce" value={loading ? '…' : summary?.totalEmployees} icon={Users} color="#4C9AFF" sub="Company staff count" delay={0} T={T} />
        <StatCard label="Pending Applications" value={pendingEmployees.length} icon={UserPlus} color="#FFAB00" sub="Employee signups awaiting review" delay={0.05} T={T} />
        <StatCard label="Active Projects" value={loading ? '…' : summary?.totalProjects} icon={FolderKanban} color="#FFDA75" sub="In progress projects" delay={0.1} T={T} />
        <StatCard label="Transactions" value={loading ? '…' : summary?.totalTransactions} icon={Coins} color="#BF9AFF" sub="Company expenses" delay={0.15} T={T} />
      </div>

      {/* ── Employee Signup Approval Queue (Company Owner Authority) ── */}
      <div className="glass" style={{ padding: 24, borderRadius: 16, background: T.cardBg, border: `1px solid ${T.cardBdr}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserPlus style={{ width: 20, height: 20, color: '#FFAB00' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPri, margin: 0 }}>Employee Signup Approval Queue</h3>
            <span className="pill pill-gold">{pendingEmployees.length} Pending</span>
          </div>
        </div>

        {pendingEmployees.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: T.textMut, fontSize: 13, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
            <CheckCircle2 style={{ width: 24, height: 24, color: '#57D9A3', margin: '0 auto 6px' }} />
            No pending employee signup requests for your company.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="gs-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Rate ($/hr)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Company Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingEmployees.map(emp => (
                  <tr key={emp.EmployeeId}>
                    <td style={{ fontWeight: 700, color: T.textPri }}>{emp.FullName}</td>
                    <td style={{ fontSize: 12 }}>{emp.Email}</td>
                    <td>{emp.Designation}</td>
                    <td style={{ fontWeight: 700, color: '#4C9AFF' }}>${emp.HourlyRate}/hr</td>
                    <td><span className="pill pill-gold">Pending Company Approval</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => handleApproveEmployee(emp.EmployeeId)}
                          style={{ padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #36B37E, #00875A)', color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <CheckCircle2 style={{ width: 14, height: 14 }} /> Approve Access
                        </button>
                        <button
                          onClick={() => handleRejectEmployee(emp.EmployeeId)}
                          style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,86,48,0.15)', color: '#FF5630', fontWeight: 700, fontSize: 12, border: '1px solid rgba(255,86,48,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <XCircle style={{ width: 14, height: 14 }} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Projects + Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16 }}>

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(12px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.divider}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.textPri, margin: 0 }}>Company Projects</p>
            <Link to="/projects" style={{ fontSize: 12, fontWeight: 700, color: '#4C9AFF', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
              View all <ChevronRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {loading
            ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2].map(i => <div key={i} style={{ height: 52, borderRadius: 10, background: T.shimmer, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
              </div>
            : projects.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: T.textMut, fontSize: 13 }}>
                  No company projects found.
                </div>
              ) : projects.map((p, i) => (
                <div key={p.projectId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${T.divider}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,218,117,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#FFDA75' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: T.textPri, margin: 0 }}>{p.projectName}</p>
                      <p style={{ fontSize: 11, color: T.textMut, margin: '2px 0 0' }}>Budget: ${Number(p.totalBudget).toLocaleString()}</p>
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                    background: p.status === 'In Progress' ? 'rgba(255,171,0,0.15)' : 'rgba(54,179,126,0.15)',
                    color: p.status === 'In Progress' ? '#FFDA75' : '#57D9A3',
                    border: `1px solid ${p.status === 'In Progress' ? 'rgba(255,171,0,0.3)' : 'rgba(54,179,126,0.3)'}`,
                  }}>
                    {p.status}
                  </span>
                </div>
              ))
          }
        </motion.div>

        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(12px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.divider}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.textPri, margin: 0 }}>Recent Financial Expenses</p>
            <Link to="/finance" style={{ fontSize: 12, fontWeight: 700, color: '#4C9AFF', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
              View <ChevronRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {loading
            ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 40, borderRadius: 8, background: T.shimmer, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
              </div>
            : txns.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: T.textMut, fontSize: 13 }}>
                  No recent financial expenses recorded.
                </div>
              ) : txns.map(t => (
                <div key={t.transactionId} style={{ padding: '11px 20px', borderBottom: `1px solid ${T.divider}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <AlertTriangle style={{ width: 13, height: 13, flexShrink: 0, color: '#FF8F73' }} />
                      <p style={{ fontSize: 12, fontWeight: 600, color: T.textPri, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.type}</p>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#FF8F73', margin: 0, flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                      -${Number(t.amount).toLocaleString()}
                    </p>
                  </div>
                  <p style={{ fontSize: 10, color: T.textMut, margin: '3px 0 0 21px' }}>
                    {new Date(t.transactionDate).toLocaleDateString()}
                  </p>
                </div>
              ))
          }
        </motion.div>
      </div>

    </div>
  );
}
