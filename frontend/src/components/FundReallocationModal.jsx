import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, X, ArrowRight, DollarSign, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../config/api';

export default function FundReallocationModal({ isOpen, onClose, accounts = [], onReallocated, lightMode }) {
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.AccountId || '');
  const [targetAccountId, setTargetAccountId] = useState(accounts[1]?.AccountId || '');
  const [amount, setAmount] = useState('5000');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!sourceAccountId || !targetAccountId) {
      setError('Please select both source and target financial accounts.');
      return;
    }
    if (sourceAccountId === targetAccountId) {
      setError('Source and target accounts must be different.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid reallocation amount greater than zero.');
      return;
    }
    if (!reason.trim()) {
      setError('Please enter an audit reason for the budget reallocation.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        projectId: 1,
        sourceAccountId: parseInt(sourceAccountId),
        targetAccountId: parseInt(targetAccountId),
        amount: parseFloat(amount),
        reason: reason.trim()
      };

      await api.reallocateFunds(payload);
      setSuccess('Funds reallocated and logged to ERP audit stream successfully!');
      setTimeout(() => {
        onClose();
        if (onReallocated) onReallocated();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to reallocate funds.');
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
          width: '100%', maxWidth: 480, borderRadius: 20, background: cardBg,
          border: `1px solid ${border}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', padding: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0052CC, #BF9AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <RefreshCw style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Inter-Account Fund Reallocation</h3>
              <p style={{ fontSize: 11, color: textMut, margin: 0 }}>CFO Controller Budget Transfer</p>
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
            <label className="gs-label" style={{ color: textMut }}>Source Account (Transfer From) *</label>
            <select
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border }}
              value={sourceAccountId}
              onChange={e => setSourceAccountId(e.target.value)}
            >
              {accounts.map(a => (
                <option key={a.AccountId} value={a.AccountId}>
                  {a.AccountName} (Available: ${a.CurrentBalance?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="gs-label" style={{ color: textMut }}>Target Account (Transfer To) *</label>
            <select
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border }}
              value={targetAccountId}
              onChange={e => setTargetAccountId(e.target.value)}
            >
              {accounts.map(a => (
                <option key={a.AccountId} value={a.AccountId}>
                  {a.AccountName} (Current: ${a.CurrentBalance?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="gs-label" style={{ color: textMut }}>Reallocation Amount ($) *</label>
            <input
              type="number"
              required
              step="100"
              placeholder="10000"
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="gs-label" style={{ color: textMut }}>Audit Reason & Justification *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Reallocating hardware budget surplus to cloud DevOps expansion."
              className="gs-input"
              style={{ background: inputBg, color: textPri, borderColor: border, resize: 'none' }}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Inter-Account Transfer'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
