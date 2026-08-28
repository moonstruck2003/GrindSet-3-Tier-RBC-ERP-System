import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, X, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../config/api';

export default function ExpenseClaimModal({ isOpen, onClose, accounts = [], user, onClaimSubmitted, lightMode }) {
  const [accountId, setAccountId] = useState(accounts[0]?.AccountId || '');
  const [expenseType, setExpenseType] = useState('Dev Hardware Equipment');
  const [amount, setAmount] = useState('350');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!accountId) {
      setError('Please select a target project financial account.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid expense amount greater than zero.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        accountId: parseInt(accountId),
        employeeId: user?.userId || 2,
        type: expenseType,
        amount: parseFloat(amount),
        note: note.trim() || `${expenseType} claim submitted by ${user?.fullName || user?.email}`
      };

      await api.submitExpenseClaim(payload);
      setSuccess('Reimbursement claim submitted to Company for approval!');
      setTimeout(() => {
        onClose();
        if (onClaimSubmitted) onClaimSubmitted();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setLoading(false);
    }
  };

  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const inputBg = lightMode ? '#FAFBFC' : 'rgba(255,255,255,0.05)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        style={{
          width: '100%', maxWidth: 460, borderRadius: 20, background: cardBg,
          border: `1px solid ${border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', padding: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #36B37E, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Coins style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Submit Reimbursement Claim</h3>
              <p style={{ fontSize: 11, color: textMut, margin: 0 }}>Employee Operational Expense Claim</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(222,53,11,0.12)', border: '1px solid rgba(222,53,11,0.3)', color: '#FF8F73', fontSize: 12, marginBottom: 14 }}>
            <AlertCircle style={{ width: 15, height: 15 }} /> {error}
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(54,179,126,0.12)', border: '1px solid rgba(54,179,126,0.3)', color: '#57D9A3', fontSize: 12, marginBottom: 14 }}>
            <CheckCircle2 style={{ width: 15, height: 15 }} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="gs-label" style={{ color: textMut }}>Target Financial Account *</label>
            <select
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border }}
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
            >
              {accounts.map(a => (
                <option key={a.AccountId} value={a.AccountId}>{a.AccountName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="gs-label" style={{ color: textMut }}>Expense Category / Type *</label>
            <select
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border }}
              value={expenseType}
              onChange={e => setExpenseType(e.target.value)}
            >
              <option value="Dev Hardware Equipment">Dev Hardware Equipment</option>
              <option value="Cloud AWS / Hosting Service">Cloud AWS / Hosting Service</option>
              <option value="Software License / Tool">Software License / Tool</option>
              <option value="Client Travel & Onsite Expense">Client Travel & Onsite Expense</option>
              <option value="Certification & Training Fee">Certification & Training Fee</option>
            </select>
          </div>

          <div>
            <label className="gs-label" style={{ color: textMut }}>Claim Amount ($) *</label>
            <input
              type="number"
              required
              step="0.01"
              placeholder="350.00"
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="gs-label" style={{ color: textMut }}>Claim Description & Receipt Note</label>
            <textarea
              rows={3}
              placeholder="Provide details about this operational purchase..."
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border, resize: 'none' }}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Claim to Employer'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
