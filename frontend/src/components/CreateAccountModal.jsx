import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, X, DollarSign, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../config/api';

export default function CreateAccountModal({ isOpen, onClose, projects = [], targetProjectId = null, onAccountCreated, lightMode }) {
  const [projectId, setProjectId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [allocatedBudget, setAllocatedBudget] = useState('50000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setAccountName('');
      setAllocatedBudget('50000');
      const defaultPid = targetProjectId != null
        ? String(targetProjectId)
        : (projects.length > 0 ? String(projects[0]?.projectId ?? projects[0]?.ProjectId ?? '') : '');
      setProjectId(defaultPid);
    }
  }, [isOpen, targetProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!projectId) {
      setError('Please select a project to attach this financial account to.');
      return;
    }
    if (!accountName.trim()) {
      setError('Please enter an account name (e.g., Infrastructure Reserve, Cloud Operations).');
      return;
    }
    const budgetVal = parseFloat(allocatedBudget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setError('Please enter a valid initial allocated budget greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await api.createAccount({
        projectId: parseInt(projectId),
        accountName: accountName.trim(),
        allocatedBudget: budgetVal
      });

      setSuccess(`Financial account "${accountName.trim()}" created successfully with $${budgetVal.toLocaleString()} initial liquidity!`);
      setTimeout(() => {
        onClose();
        if (onAccountCreated) onAccountCreated();
      }, 750);
    } catch (err) {
      setError(err.message || 'Failed to create financial account.');
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
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 20,
          background: cardBg,
          border: `1px solid ${border}`,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          padding: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0052CC, #36B37E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Landmark style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Create Financial Account</h3>
              <p style={{ fontSize: 11, color: textMut, margin: 0 }}>Project Operating Ledger & Capital Provisioning</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,86,48,0.15)', border: '1px solid rgba(255,86,48,0.3)', color: '#FF5630', fontSize: 12, marginBottom: 14 }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(54,179,126,0.15)', border: '1px solid rgba(54,179,126,0.3)', color: '#36B37E', fontSize: 12, marginBottom: 14 }}>
            <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Target Project */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: textMut, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Target Project Scope
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: inputBg,
                  border: `1px solid ${border}`,
                  color: textPri,
                  fontSize: 13,
                  outline: 'none'
                }}
              >
                {projects.map(p => {
                  const pid = String(p.projectId ?? p.ProjectId);
                  const pname = p.projectName ?? p.ProjectName;
                  return (
                    <option key={pid} value={pid} style={{ background: lightMode ? '#FFF' : '#0B1B3D', color: textPri }}>
                      {pname} (#{pid})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: textMut, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Account Name / Cost Center
            </label>
            <input
              type="text"
              placeholder="e.g. Infrastructure Capital Reserve, Cloud Ops"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                background: inputBg,
                border: `1px solid ${border}`,
                color: textPri,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Initial Allocated Budget */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: textMut, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Initial Allocated Budget ($ USD)
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign style={{ position: 'absolute', left: 12, top: 12, width: 14, height: 14, color: textMut }} />
              <input
                type="number"
                min="0.01"
                step="any"
                placeholder="50000"
                value={allocatedBudget}
                onChange={e => setAllocatedBudget(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 32px',
                  borderRadius: 8,
                  background: inputBg,
                  border: `1px solid ${border}`,
                  color: textPri,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: textMut, margin: '4px 0 0 0' }}>
              Allocated amount sets the starting liquid capital balance.
            </p>
          </div>

          {/* Permissions Notice */}
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(0,82,204,0.08)', border: '1px solid rgba(0,82,204,0.2)', fontSize: 11, color: '#4C9AFF' }}>
            🔒 Role Policy: Only the <strong>Company Owner</strong> or designated <strong>Project Manager</strong> of this project can provision operating accounts.
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                  Provisioning...
                </>
              ) : (
                'Create Financial Account'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
