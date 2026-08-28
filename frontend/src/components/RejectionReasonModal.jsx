import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function RejectionReasonModal({ isOpen, onClose, targetItem, targetType = 'company', onSubmitRejection, lightMode }) {
  const [category, setCategory] = useState('Compliance Verification Failed');
  const [reasonNote, setReasonNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !targetItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullNote = `Category: [${category}] - ${reasonNote.trim()}`;
      await onSubmitRejection(targetItem.id || targetItem.companyId || targetItem.EmployeeId, fullNote);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to record rejection.');
    } finally {
      setSubmitting(false);
    }
  };

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const inputBg = lightMode ? '#FAFBFC' : 'rgba(255,255,255,0.05)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        style={{
          width: '100%', maxWidth: 460, borderRadius: 20, background: cardBg,
          border: `1px solid ${border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', padding: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,86,48,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF5630' }}>
              <ShieldAlert style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Official Rejection Decision</h3>
              <p style={{ fontSize: 11, color: textMut, margin: 0 }}>Record compliance rejection note</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="gs-label" style={{ color: textMut }}>Target Account</label>
            <div style={{ fontSize: 13, fontWeight: 700, color: textPri }}>
              {targetItem.companyName || targetItem.FullName || targetItem.email}
            </div>
          </div>

          <div>
            <label className="gs-label" style={{ color: textMut }}>Rejection Category *</label>
            <select
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border }}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Compliance Verification Failed">Compliance Verification Failed</option>
              <option value="Unverified Tax/Registration Number">Unverified Tax/Registration Number</option>
              <option value="Invalid Email Domain">Invalid Email Domain</option>
              <option value="Security Policy Flag">Security Policy Flag</option>
            </select>
          </div>

          <div>
            <label className="gs-label" style={{ color: textMut }}>Audit Note / Explanation *</label>
            <textarea
              required
              rows={3}
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border, resize: 'none' }}
              placeholder="Enter explanation for corporate audit log..."
              value={reasonNote}
              onChange={e => setReasonNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '9px 14px', borderRadius: 10, fontSize: 12 }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #FF5630, #DE350B)', color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: submitting ? 'wait' : 'pointer' }}>
              Confirm & Save Rejection
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
