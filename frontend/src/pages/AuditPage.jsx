import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Search, Clock } from 'lucide-react';
import { api } from '../config/api';
import { useTheme } from '../config/theme';

const ACTION_PILLS = {
  INITIALIZE_DATABASE: { color:'#4C9AFF', bg:'rgba(0,82,204,0.12)', bdr:'rgba(0,82,204,0.25)' },
  ONBOARD_EMPLOYEE:    { color:'#57D9A3', bg:'rgba(54,179,126,0.12)', bdr:'rgba(54,179,126,0.25)' },
  LOG_EXPENSE:         { color:'#BF9AFF', bg:'rgba(101,84,192,0.12)', bdr:'rgba(101,84,192,0.25)' },
};
const ROLE_PILLS = {
  Admin:    { color:'#FF8F73', bg:'rgba(255,86,48,0.12)',   bdr:'rgba(255,86,48,0.25)' },
  Company:  { color:'#FFDA75', bg:'rgba(255,171,0,0.12)',   bdr:'rgba(255,171,0,0.25)' },
  Employee: { color:'#4C9AFF', bg:'rgba(0,82,204,0.12)',    bdr:'rgba(0,82,204,0.25)' },
  System:   { color:'#79E8F5', bg:'rgba(0,184,217,0.12)',   bdr:'rgba(0,184,217,0.25)' },
};

function pill(cfg, label) {
  const c = cfg ?? { color:'#8993A4', bg:'rgba(137,147,164,0.12)', bdr:'rgba(137,147,164,0.25)' };
  return (
    <span style={{ padding:'3px 9px', borderRadius:999, fontSize:10, fontWeight:700, letterSpacing:'0.05em',
      background:c.bg, color:c.color, border:`1px solid ${c.bdr}`, whiteSpace:'nowrap' }}>
      {label}
    </span>
  );
}

function getActionCfg(action) {
  for (const [k,v] of Object.entries(ACTION_PILLS)) { if (action?.includes(k)) return v; }
  return null;
}

export default function AuditPage({ lightMode }) {
  const T = useTheme(lightMode);
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [lastRefresh, setLast]  = useState(new Date());

  const load = () => {
    setLoading(true);
    api.auditLogs().then(setLogs).catch(() => setLogs([])).finally(() => { setLoading(false); setLast(new Date()); });
  };
  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.targetEntity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:900, color:T.textPri, margin:0 }}>
            Security{' '}
            <span style={{ background:'linear-gradient(135deg,#FF8F73,#FF5630)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Audit Logs</span>
          </h2>
          <p style={{ fontSize:13, color:T.textMut, marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
            <Clock style={{width:13,height:13}} />
            {loading ? 'Refreshing…' : `Last refreshed ${lastRefresh.toLocaleTimeString()} · ${logs.length} events`}
          </p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={load} disabled={loading}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:10,
            background:'transparent', border:`1px solid ${T.cardBdr}`, color:T.textMut,
            fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          <RefreshCw style={{ width:14, height:14, animation: loading ? 'spin 0.9s linear infinite' : 'none' }} />
          Refresh
        </motion.button>
      </div>

      {/* Stat pills */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
        {[
          { label:'Total Events',      value:logs.length,                                        color:'#4C9AFF' },
          { label:'Admin Actions',     value:logs.filter(l=>l.role==='Admin').length,             color:'#FF8F73' },
          { label:'Employee Actions',  value:logs.filter(l=>l.role==='Employee').length,          color:'#57D9A3' },
          { label:'System Events',     value:logs.filter(l=>!l.role||l.role==='System').length,  color:'#BF9AFF' },
        ].map((s,i) => (
          <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
            style={{ background:T.cardBg, border:`1px solid ${T.cardBdr}`, borderRadius:14, padding:'14px 16px', backdropFilter:'blur(12px)' }}>
            <p style={{ fontSize:26, fontWeight:900, color:s.color, margin:'0 0 4px' }}>{s.value}</p>
            <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.07em', color:T.textMut, margin:0 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:'relative' }}>
        <Search style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:T.textMut }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Filter by action, user, or entity…"
          style={{ width:'100%', padding:'9px 12px 9px 36px', borderRadius:8, border:`1px solid ${T.inputBdr}`, background:T.inputBg, color:T.inputClr, fontSize:13, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' }} />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        style={{ background:T.cardBg, border:`1px solid ${T.cardBdr}`, borderRadius:16, overflow:'hidden', backdropFilter:'blur(12px)' }}>
        {loading ? (
          <div style={{ padding:24, display:'flex', flexDirection:'column', gap:12 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height:42, borderRadius:8, background:T.shimmer, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'64px 24px', textAlign:'center' }}>
            <ShieldAlert style={{ width:40, height:40, color:T.textMut, margin:'0 auto 12px' }} />
            <p style={{ fontWeight:700, color:T.textPri }}>No log entries found</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${T.divider}` }}>
                  {['#','User','Role','Action','Target Entity','Timestamp'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:800,
                      textTransform:'uppercase', letterSpacing:'0.07em', color:T.textMut, whiteSpace:'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <motion.tr key={log.auditLogId}
                    initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:Math.min(i*0.025,0.3) }}
                    style={{ borderBottom:`1px solid ${T.divider}`, transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding:'12px 14px', color:T.textMut, fontFamily:'JetBrains Mono,monospace' }}>#{log.auditLogId}</td>
                    <td style={{ padding:'12px 14px', fontWeight:600, color:T.textPri }}>{log.email}</td>
                    <td style={{ padding:'12px 14px' }}>{pill(ROLE_PILLS[log.role], log.role ?? 'System')}</td>
                    <td style={{ padding:'12px 14px' }}>{pill(getActionCfg(log.action), log.action)}</td>
                    <td style={{ padding:'12px 14px', fontFamily:'JetBrains Mono,monospace', color:T.textMut, fontSize:11 }}>{log.targetEntity}</td>
                    <td style={{ padding:'12px 14px', fontFamily:'JetBrains Mono,monospace', color:T.textMut, fontSize:11, whiteSpace:'nowrap' }}>
                      {new Date(log.eventTime).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
