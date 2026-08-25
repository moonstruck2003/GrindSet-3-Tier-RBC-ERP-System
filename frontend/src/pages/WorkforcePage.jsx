import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Mail, X, Check, Users } from 'lucide-react';
import { api } from '../config/api';
import { useTheme } from '../config/theme';

const AVATARS = ['🧑‍💻','👩‍💼','🧑‍🔬','👨‍🎨','👩‍🔧','🧑‍🏫','👨‍💻','👩‍🚀'];
const ACCENT_COLORS = ['#4C9AFF','#57D9A3','#FFDA75','#BF9AFF','#FF8F73','#79E8F5'];

export default function WorkforcePage({ lightMode }) {
  const T = useTheme(lightMode);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ email: '', fullName: '', designation: '', hourlyRate: '' });

  const load = () => {
    setLoading(true);
    api.employees().then(setEmployees).catch(() => setEmployees([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = employees.filter(e =>
    e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e.designation?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.fullName || !form.designation || !form.hourlyRate) { showToast('Please fill all fields.', false); return; }
    setSaving(true);
    try {
      await api.addEmployee({ email: form.email, fullName: form.fullName, designation: form.designation, hourlyRate: parseFloat(form.hourlyRate) });
      setForm({ email: '', fullName: '', designation: '', hourlyRate: '' });
      setShowForm(false);
      showToast('Employee onboarded successfully!');
      load();
    } catch (err) {
      showToast(`Error: ${err.message}`, false);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${T.inputBdr}`, background: T.inputBg, color: T.inputClr, fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMut, marginBottom: 6 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
            style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 18px', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              background: toast.ok ? '#36B37E' : '#FF5630', color: 'white', fontSize: 13, fontWeight: 600 }}>
            {toast.ok ? <Check style={{ width: 15, height: 15 }} /> : <X style={{ width: 15, height: 15 }} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: T.textPri, margin: 0 }}>
            Workforce{' '}
            <span style={{ background: 'linear-gradient(135deg,#79F2C0,#36B37E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Directory</span>
          </h2>
          <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>
            {employees.length} employee{employees.length !== 1 ? 's' : ''} registered across all departments
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 11,
            background: 'linear-gradient(135deg,#0065FF,#0052CC)', color: 'white', fontWeight: 700,
            fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,82,204,0.35)' }}>
          <UserPlus style={{ width: 15, height: 15 }} /> Onboard Employee
        </motion.button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: T.textMut }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, role, or email…"
          style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {/* Table card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 54, borderRadius: 10, background: T.shimmer, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <Users style={{ width: 40, height: 40, color: T.textMut, margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, color: T.textPri, marginBottom: 6 }}>No employees found</p>
            <p style={{ fontSize: 13, color: T.textMut }}>Try a different search or onboard a new employee.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
                  {['Employee', 'Designation', 'Department', 'Email', 'Hourly Rate'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Hourly Rate' ? 'right' : 'left',
                      fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.textMut, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <motion.tr key={emp.employeeId}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: `1px solid ${T.divider}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${ACCENT_COLORS[i % ACCENT_COLORS.length]}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          {AVATARS[i % AVATARS.length]}
                        </div>
                        <span style={{ fontWeight: 600, color: T.textPri }}>{emp.fullName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                        background: 'rgba(0,82,204,0.12)', color: '#4C9AFF', border: '1px solid rgba(0,82,204,0.25)' }}>
                        {emp.designation}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', color: T.textMut, fontSize: 12 }}>{emp.departmentName}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.textMut, fontSize: 12 }}>
                        <Mail style={{ width: 12, height: 12, flexShrink: 0 }} />
                        {emp.email}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: '#57D9A3', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
                        ${Number(emp.hourlyRate).toFixed(2)}<span style={{ fontSize: 10, fontWeight: 500 }}>/hr</span>
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Onboard Modal */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              style={{ width: '100%', maxWidth: 420, borderRadius: 20, overflow: 'hidden',
                background: lightMode ? '#FFFFFF' : '#0B1B3D', border: `1px solid ${T.cardBdr}`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${T.divider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(87,217,163,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus style={{ width: 15, height: 15, color: '#57D9A3' }} />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: T.textPri, margin: 0 }}>Onboard New Employee</h3>
                </div>
                <button onClick={() => setShowForm(false)}
                  style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMut }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <form onSubmit={handleSubmit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'John Doe' },
                  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@company.com' },
                  { label: 'Designation / Role', key: 'designation', type: 'text', placeholder: 'Senior Engineer' },
                  { label: 'Hourly Rate (USD)', key: 'hourlyRate', type: 'number', placeholder: '85.00' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={inputStyle} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'transparent', border: `1px solid ${T.cardBdr}`, color: T.textMut, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#0065FF,#0052CC)', color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {saving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Saving…</> : 'Onboard Employee'}
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
