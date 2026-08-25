import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Calendar, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../config/api';
import { useTheme } from '../config/theme';

const STATUS = {
  'In Progress': { bg: 'rgba(255,171,0,0.15)',  color: '#FFDA75', bdr: 'rgba(255,171,0,0.3)',  dot: '#FFAB00' },
  'Completed':   { bg: 'rgba(54,179,126,0.15)', color: '#57D9A3', bdr: 'rgba(54,179,126,0.3)', dot: '#36B37E' },
  'On Hold':     { bg: 'rgba(255,86,48,0.15)',  color: '#FF8F73', bdr: 'rgba(255,86,48,0.3)',  dot: '#FF5630' },
  'Planning':    { bg: 'rgba(0,82,204,0.15)',   color: '#4C9AFF', bdr: 'rgba(0,82,204,0.3)',   dot: '#0052CC' },
};

const KANBAN = [
  { title:'To Do',       dot:'#8993A4', cards:[
    { id:'GS-12', title:'RBAC Permissions Matrix',   tag:'Auth',     tagC:'#FF8F73', tagBg:'rgba(255,86,48,0.12)' },
    { id:'GS-13', title:'Reset Password Flow',       tag:'Auth',     tagC:'#FF8F73', tagBg:'rgba(255,86,48,0.12)' },
  ]},
  { title:'In Progress', dot:'#FFAB00', cards:[
    { id:'GS-08', title:'Employee Onboarding API',   tag:'Workforce',tagC:'#57D9A3', tagBg:'rgba(54,179,126,0.12)' },
    { id:'GS-09', title:'React Dashboard Shell',     tag:'Frontend', tagC:'#4C9AFF', tagBg:'rgba(0,82,204,0.12)' },
  ]},
  { title:'In Review',   dot:'#00B8D9', cards:[
    { id:'GS-05', title:'EF Core Migrations Setup',  tag:'Backend',  tagC:'#BF9AFF', tagBg:'rgba(101,84,192,0.12)' },
  ]},
  { title:'Done',        dot:'#36B37E', cards:[
    { id:'GS-01', title:'Monorepo Scaffold',         tag:'Infra',    tagC:'#79E8F5', tagBg:'rgba(0,184,217,0.12)' },
    { id:'GS-02', title:'SQLite 20-Table ERD',       tag:'Database', tagC:'#FFDA75', tagBg:'rgba(255,171,0,0.12)' },
    { id:'GS-03', title:'Swagger OpenAPI Docs',      tag:'Backend',  tagC:'#BF9AFF', tagBg:'rgba(101,84,192,0.12)' },
  ]},
];

function ProgressBar({ pct, dot, delay }) {
  return (
    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, delay }}
        style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${dot}66,${dot})` }}
      />
    </div>
  );
}

export default function ProjectsPage({ lightMode }) {
  const T = useTheme(lightMode);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('cards');

  useEffect(() => {
    api.projects().then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);

  const demoProjects = [{ projectId:1, projectName:'Core ERP Platform v1.0', status:'In Progress', totalBudget:250000, companyId:2 }];
  const list = projects.length ? projects : demoProjects;

  const totalBudget = list.reduce((s,p) => s + Number(p.totalBudget || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: T.textPri, margin: 0 }}>
            Project{' '}
            <span style={{ background: 'linear-gradient(135deg,#FFE380,#FFAB00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Management</span>
          </h2>
          <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>{list.length} project{list.length !== 1 ? 's' : ''} in the portfolio</p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.cardBdr}` }}>
          {['cards','kanban'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '8px 18px', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif',
                background: view === v ? '#0052CC' : T.cardBg, color: view === v ? 'white' : T.textMut, transition: 'all .15s' }}>
              {v === 'cards' ? '⊞ Cards' : '⊟ Kanban'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
        {[
          { label:'Total Budget',  value:`$${totalBudget.toLocaleString()}`,                   color:'#57D9A3', icon:DollarSign  },
          { label:'In Progress',   value:list.filter(p=>p.status==='In Progress').length,       color:'#FFDA75', icon:TrendingUp  },
          { label:'Completed',     value:list.filter(p=>p.status==='Completed').length,         color:'#BF9AFF', icon:CheckCircle },
          { label:'On Hold',       value:list.filter(p=>p.status==='On Hold').length,           color:'#FF8F73', icon:AlertCircle },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}
            style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(12px)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: 17, height: 17, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.textMut, margin: 0 }}>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cards view */}
      {view === 'cards' && (
        loading
          ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {[1,2,3].map(i => <div key={i} style={{ height:220, borderRadius:16, background: T.shimmer, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />)}
            </div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {list.map((p, i) => {
                const s = STATUS[p.status] ?? STATUS['Planning'];
                const pct = 40 + (i * 17 + 22) % 45;
                return (
                  <motion.div key={p.projectId}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
                    whileHover={{ y:-5, boxShadow:`0 18px 52px ${s.dot}18` }}
                    style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderTop:`3px solid ${s.dot}`,
                      borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:14, backdropFilter:'blur(12px)', cursor:'default' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:`${s.dot}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <FolderKanban style={{ width:20, height:20, color:s.dot }} />
                      </div>
                      <span style={{ padding:'3px 10px', borderRadius:999, fontSize:10, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.bdr}` }}>
                        {p.status}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontWeight:800, fontSize:14, color:T.textPri, margin:'0 0 4px' }}>{p.projectName}</p>
                      <p style={{ fontSize:11, color:T.textMut, margin:0 }}>Project #{String(p.projectId).padStart(3,'0')}</p>
                    </div>
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:T.textMut, marginBottom:6 }}>
                        <span>Completion</span>
                        <span style={{ fontWeight:800, color:s.dot }}>{pct}%</span>
                      </div>
                      <ProgressBar pct={pct} dot={s.dot} delay={i*0.07 + 0.3} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:T.textMut }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <DollarSign style={{ width:13, height:13 }} />
                        <span style={{ fontWeight:700, color:'#57D9A3', fontFamily:'JetBrains Mono,monospace' }}>
                          ${Number(p.totalBudget).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <Calendar style={{ width:13, height:13 }} />
                        <span>Q4 2026</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
          {KANBAN.map((col, ci) => (
            <motion.div key={col.title}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: ci*0.07 }}
              style={{ background: T.cardBg, border:`1px solid ${T.cardBdr}`, borderRadius:16, overflow:'hidden', backdropFilter:'blur(12px)' }}>
              {/* Column header */}
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'13px 16px', borderBottom:`1px solid ${T.divider}`, borderTop:`2px solid ${col.dot}` }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:col.dot, boxShadow:`0 0 6px ${col.dot}` }} />
                <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:col.dot, margin:0 }}>{col.title}</p>
                <span style={{ marginLeft:'auto', padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:800, background:`${col.dot}15`, color:col.dot }}>
                  {col.cards.length}
                </span>
              </div>
              {/* Cards */}
              <div style={{ padding:'10px 10px', display:'flex', flexDirection:'column', gap:8 }}>
                {col.cards.map(card => (
                  <motion.div key={card.id} whileHover={{ scale:1.02 }}
                    style={{ padding:'10px 12px', borderRadius:10, border:`1px solid ${T.divider}`,
                      background: lightMode ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.04)', cursor:'pointer' }}>
                    <p style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:T.textMut, margin:'0 0 5px' }}>{card.id}</p>
                    <p style={{ fontSize:12, fontWeight:600, color:T.textPri, margin:'0 0 8px', lineHeight:1.4 }}>{card.title}</p>
                    <span style={{ padding:'2px 8px', borderRadius:999, fontSize:10, fontWeight:700, background:card.tagBg, color:card.tagC }}>
                      {card.tag}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
