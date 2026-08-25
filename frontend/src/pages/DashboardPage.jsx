import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, FolderKanban, Coins, ShieldAlert, TrendingUp,
  ChevronRight, DollarSign, AlertTriangle, Database, Zap, Activity
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

function ChartCard({ title, value, pill, pillColor, data, lineColor, labels, delay, T }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: 16, padding: '20px 22px', backdropFilter: 'blur(12px)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: T.textMut, marginBottom: 5 }}>{title}</p>
          <p style={{ fontSize: 26, fontWeight: 900, color: lineColor, margin: 0 }}>{value}</p>
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 999, background: `${lineColor}18`, border: `1px solid ${lineColor}30`, display: 'flex', alignItems: 'center', gap: 5 }}>
          <TrendingUp style={{ width: 12, height: 12, color: lineColor }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: lineColor }}>{pill}</span>
        </div>
      </div>
      <SparkLine data={data} color={lineColor} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {labels.map(l => <span key={l} style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: T.textMut }}>{l}</span>)}
      </div>
    </motion.div>
  );
}

export default function DashboardPage({ lightMode }) {
  const T = useTheme(lightMode);
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.erdSummary(), api.projects(), api.transactions()])
      .then(([s, p, t]) => { setSummary(s); setProjects(p); setTxns(t.slice(0, 6)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const WEEKS = ['W1','W2','W3','W4','W5','W6','W7','W8'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: T.textPri, margin: 0 }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg,#4C9AFF,#0052CC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SuperAdmin</span> 👋
          </h2>
          <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>Here's your enterprise overview for today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 20,
          background: 'rgba(0,82,204,0.12)', border: '1px solid rgba(0,82,204,0.25)',
          fontSize: 11, fontWeight: 700, color: '#4C9AFF', fontFamily: 'JetBrains Mono, monospace' }}>
          <Zap style={{ width: 13, height: 13 }} />
          Live · ASP.NET Core
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total Employees" value={loading ? '…' : summary?.totalEmployees} icon={Users}      color="#4C9AFF" sub="Across all departments"   delay={0}    T={T} />
        <StatCard label="Active Projects" value={loading ? '…' : summary?.totalProjects}  icon={FolderKanban} color="#FFDA75" sub="In progress"             delay={0.05} T={T} />
        <StatCard label="Transactions"    value={loading ? '…' : summary?.totalTransactions} icon={Coins}  color="#BF9AFF" sub="All-time logged expenses" delay={0.1}  T={T} />
        <StatCard label="Audit Events"    value={loading ? '…' : summary?.totalAuditLogs} icon={ShieldAlert} color="#FF8F73" sub="Security log entries"    delay={0.15} T={T} />
      </div>

      {/* Chart row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <ChartCard title="Sprint Velocity" value="90%" pill="+18% this week" lineColor="#36B37E" data={SPRINT} labels={WEEKS} delay={0.2} T={T} />
        <ChartCard title="Budget Utilization" value="$112,500" pill="75% used" lineColor="#6554C0" data={BUDGET} labels={WEEKS} delay={0.25} T={T} />
      </div>

      {/* Projects + Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16 }}>

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(12px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.divider}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.textPri, margin: 0 }}>Active Projects</p>
            <Link to="/projects" style={{ fontSize: 12, fontWeight: 700, color: '#4C9AFF', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
              View all <ChevronRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {loading
            ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2].map(i => <div key={i} style={{ height: 52, borderRadius: 10, background: T.shimmer, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
              </div>
            : (projects.length ? projects : [{ projectId:1, projectName:'Core ERP Platform v1.0', status:'In Progress', totalBudget:250000 }]).map((p, i) => (
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
            <p style={{ fontSize: 13, fontWeight: 700, color: T.textPri, margin: 0 }}>Recent Expenses</p>
            <Link to="/finance" style={{ fontSize: 12, fontWeight: 700, color: '#4C9AFF', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
              View <ChevronRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {loading
            ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 40, borderRadius: 8, background: T.shimmer, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
              </div>
            : (txns.length ? txns : [{ transactionId:1, type:'Infrastructure Cloud Expense', amount:4500, transactionDate: new Date().toISOString() }]).map(t => (
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

      {/* ERD badge */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 14,
          background: 'rgba(0,82,204,0.08)', border: '1px solid rgba(0,82,204,0.18)' }}>
        <Database style={{ width: 14, height: 14, color: '#4C9AFF', flexShrink: 0 }} />
        <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#4C9AFF', margin: 0 }}>
          {summary
            ? `SQLite ERD · ${summary.erdTablesCount ?? 20} tables · ${summary.erdSchemaStatus ?? 'Verified & Auto-Seeded'} · ${summary.totalUsers ?? '—'} registered users`
            : 'Loading ERD summary…'}
        </p>
      </motion.div>
    </div>
  );
}
