import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, PlusCircle, ArrowDownLeft, X, Check, AlertTriangle, Wallet, TrendingDown } from 'lucide-react';
import { api } from '../config/api';
import { useTheme } from '../config/theme';

function BudgetBar({ pct, delay }) {
  const over = pct > 85;
  return (
    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8, delay }}
        style={{ height: '100%', borderRadius: 99,
          background: over ? 'linear-gradient(90deg,#FF7452,#FF5630)' : 'linear-gradient(90deg,#BF9AFF88,#6554C0)' }}
      />
    </div>
  );
}

export default function FinancePage({ lightMode }) {
  const T = useTheme(lightMode);
  const [accounts, setAccounts]   = useState([]);
  const [txns, setTxns]           = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [form, setForm]           = useState({ accountId:'', loggedByEmployeeId:'', type:'', amount:'' });

  const load = () => {
    setLoading(true);
    Promise.all([api.accounts(), api.transactions(), api.employees()])
      .then(([a,t,e]) => { setAccounts(a); setTxns(t); setEmployees(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(() => setToast(null), 3200); };

  const handleLog = async (e) => {
    e.preventDefault();
    if (!form.accountId || !form.type || !form.amount) { showToast('Fill all required fields.', false); return; }
    setSaving(true);
    try {
      await api.addTransaction({ accountId:parseInt(form.accountId), loggedByEmployeeId:parseInt(form.loggedByEmployeeId)||1, type:form.type, amount:parseFloat(form.amount) });
      setForm({ accountId:'', loggedByEmployeeId:'', type:'', amount:'' });
      setShowForm(false);
      showToast('Transaction logged!');
      load();
    } catch(err) {
      showToast(`Error: ${err.message}`, false);
    } finally {
      setSaving(false);
    }
  };

  const demoAccounts = [{ accountId:1, accountName:'Engineering Operations', allocatedBudget:150000, currentBalance:112500, projectId:1 }];
  const demoTxns     = [{ transactionId:1, type:'Infrastructure Cloud Expense', amount:4500, loggedBy:'John Doe', transactionDate:new Date().toISOString(), accountName:'Engineering Operations' }];

  const accs  = accounts.length  ? accounts  : demoAccounts;
  const tlist = txns.length      ? txns      : demoTxns;

  const totalAllocated = accs.reduce((s,a) => s + Number(a.allocatedBudget||0), 0);
  const totalBalance   = accs.reduce((s,a) => s + Number(a.currentBalance||0), 0);
  const totalSpent     = totalAllocated - totalBalance;

  const inputStyle  = { width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${T.inputBdr}`, background:T.inputBg, color:T.inputClr, fontSize:13, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' };
  const labelStyle  = { display:'block', fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textMut, marginBottom:6 };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-16, scale:0.92 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, scale:0.92 }}
            style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', alignItems:'center', gap:8,
              padding:'11px 18px', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.35)',
              background:toast.ok ? '#36B37E' : '#FF5630', color:'white', fontSize:13, fontWeight:600 }}>
            {toast.ok ? <Check style={{width:15,height:15}} /> : <X style={{width:15,height:15}} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:900, color:T.textPri, margin:0 }}>
            Financial{' '}
            <span style={{ background:'linear-gradient(135deg,#BF9AFF,#6554C0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Ledger</span>
          </h2>
          <p style={{ fontSize:13, color:T.textMut, marginTop:4 }}>{accs.length} account{accs.length!==1?'s':''} · {tlist.length} transactions</p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => setShowForm(true)}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:11,
            background:'linear-gradient(135deg,#0065FF,#0052CC)', color:'white', fontWeight:700,
            fontSize:13, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(0,82,204,0.35)' }}>
          <PlusCircle style={{width:15,height:15}} /> Log Expense
        </motion.button>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
        {[
          { label:'Total Allocated', value:`$${totalAllocated.toLocaleString()}`, color:'#4C9AFF', icon:Wallet },
          { label:'Total Spent',     value:`$${totalSpent.toLocaleString()}`,     color:'#FF8F73', icon:TrendingDown },
          { label:'Remaining',       value:`$${totalBalance.toLocaleString()}`,   color:'#57D9A3', icon:Coins },
        ].map((k,i) => (
          <motion.div key={i} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            style={{ background:T.cardBg, border:`1px solid ${T.cardBdr}`, borderLeft:`3px solid ${k.color}`,
              borderRadius:14, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, backdropFilter:'blur(12px)' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${k.color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <k.icon style={{ width:18, height:18, color:k.color }} />
            </div>
            <div>
              <p style={{ fontSize:20, fontWeight:900, color:k.color, margin:0, fontFamily:'JetBrains Mono,monospace' }}>{k.value}</p>
              <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.07em', color:T.textMut, margin:0 }}>{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Accounts + Transactions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>

        {/* Accounts */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          style={{ background:T.cardBg, border:`1px solid ${T.cardBdr}`, borderRadius:16, overflow:'hidden', backdropFilter:'blur(12px)' }}>
          <div style={{ padding:'15px 20px', borderBottom:`1px solid ${T.divider}` }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.textPri, margin:0 }}>Financial Accounts</p>
          </div>
          {loading
            ? <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
                {[1,2].map(i => <div key={i} style={{ height:72, borderRadius:10, background:T.shimmer, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />)}
              </div>
            : accs.map((acc,i) => {
                const pct = (1 - Number(acc.currentBalance) / Number(acc.allocatedBudget)) * 100;
                return (
                  <motion.div key={acc.accountId} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.08 }}
                    style={{ padding:'16px 20px', borderBottom:`1px solid ${T.divider}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div>
                        <p style={{ fontWeight:700, fontSize:13, color:T.textPri, margin:'0 0 3px' }}>{acc.accountName}</p>
                        <p style={{ fontSize:11, color:T.textMut, margin:0 }}>Project #{acc.projectId}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontWeight:800, fontSize:14, color: pct>85 ? '#FF8F73' : '#57D9A3', margin:'0 0 2px', fontFamily:'JetBrains Mono,monospace' }}>
                          ${Number(acc.currentBalance).toLocaleString()}
                        </p>
                        <p style={{ fontSize:10, color:T.textMut, margin:0 }}>of ${Number(acc.allocatedBudget).toLocaleString()}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1 }}><BudgetBar pct={pct} delay={i*0.08} /></div>
                      <span style={{ fontSize:10, fontWeight:800, color: pct>85 ? '#FF8F73' : '#BF9AFF', fontFamily:'JetBrains Mono,monospace', flexShrink:0 }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    {pct > 80 && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:11, fontWeight:600, color:'#FF8F73' }}>
                        <AlertTriangle style={{width:12,height:12}} /> Budget overrun risk
                      </div>
                    )}
                  </motion.div>
                );
              })
          }
        </motion.div>

        {/* Transactions */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          style={{ background:T.cardBg, border:`1px solid ${T.cardBdr}`, borderRadius:16, overflow:'hidden', backdropFilter:'blur(12px)' }}>
          <div style={{ padding:'15px 20px', borderBottom:`1px solid ${T.divider}` }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.textPri, margin:0 }}>Transaction Ledger</p>
          </div>
          <div style={{ overflowY:'auto', maxHeight:340 }}>
            {loading
              ? <div style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height:48, borderRadius:8, background:T.shimmer, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />)}
                </div>
              : tlist.map((t,i) => (
                  <motion.div key={t.transactionId}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:`1px solid ${T.divider}`,
                      transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,86,48,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <ArrowDownLeft style={{ width:15, height:15, color:'#FF8F73' }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12, fontWeight:600, color:T.textPri, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.type}</p>
                      <p style={{ fontSize:10, color:T.textMut, margin:0 }}>{t.loggedBy||'System'} · {new Date(t.transactionDate).toLocaleDateString()}</p>
                    </div>
                    <p style={{ fontWeight:800, color:'#FF8F73', fontSize:13, margin:0, flexShrink:0, fontFamily:'JetBrains Mono,monospace' }}>
                      -${Number(t.amount).toLocaleString()}
                    </p>
                  </motion.div>
                ))
            }
          </div>
        </motion.div>
      </div>

      {/* Log Expense Modal */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }}>
            <motion.div initial={{ scale:0.93, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.93, opacity:0 }}
              style={{ width:'100%', maxWidth:420, borderRadius:20, overflow:'hidden',
                background: lightMode ? '#FFFFFF' : '#0B1B3D', border:`1px solid ${T.cardBdr}`, boxShadow:'0 24px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:`1px solid ${T.divider}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:'rgba(191,154,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Coins style={{ width:15, height:15, color:'#BF9AFF' }} />
                  </div>
                  <h3 style={{ fontWeight:800, fontSize:15, color:T.textPri, margin:0 }}>Log Expense</h3>
                </div>
                <button onClick={() => setShowForm(false)} style={{ padding:6, borderRadius:8, background:'transparent', border:'none', cursor:'pointer', color:T.textMut }}>
                  <X style={{width:16,height:16}} />
                </button>
              </div>
              <form onSubmit={handleLog} style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={labelStyle}>Account</label>
                  <select style={inputStyle} value={form.accountId} onChange={e => setForm(f=>({...f,accountId:e.target.value}))}>
                    <option value="">Select account…</option>
                    {accs.map(a => <option key={a.accountId} value={a.accountId}>{a.accountName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Logged By</label>
                  <select style={inputStyle} value={form.loggedByEmployeeId} onChange={e => setForm(f=>({...f,loggedByEmployeeId:e.target.value}))}>
                    <option value="">Select employee…</option>
                    {employees.map(e => <option key={e.employeeId} value={e.employeeId}>{e.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Expense Description</label>
                  <input style={inputStyle} placeholder="e.g. Cloud Infrastructure" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} />
                </div>
                <div>
                  <label style={labelStyle}>Amount (USD)</label>
                  <input style={inputStyle} type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} />
                </div>
                <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex:1, padding:'10px', borderRadius:10, background:'transparent', border:`1px solid ${T.cardBdr}`, color:T.textMut, fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex:1, padding:'10px', borderRadius:10, background:'linear-gradient(135deg,#0065FF,#0052CC)', color:'white', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'Inter,sans-serif' }}>
                    {saving ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Saving…</> : 'Log Expense'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
