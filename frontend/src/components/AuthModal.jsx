import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, User, Mail, Lock, ChevronRight, AlertCircle, CheckCircle2, Loader2, Building2, Eye, EyeOff, Check } from 'lucide-react';
import { api } from '../config/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signup', isDark = true }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [role, setRole] = useState('Employee'); // 'Employee' | 'CompanyOwner' | 'SuperAdmin'

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [designation, setDesignation] = useState('Full Stack Developer');
  const [hourlyRate, setHourlyRate] = useState('85');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Enterprise Technology');
  const [companyList, setCompanyList] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.publicCompanies().then(comps => {
        setCompanyList(comps || []);
        if (comps && comps.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(comps[0].companyId);
        }
      }).catch(() => setCompanyList([]));
    }
  }, [isOpen]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setLoading(false);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    if (newMode === 'signup' && role === 'SuperAdmin') {
      setRole('Employee');
    }
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setDevResetUrl('');
    resetForm();
  };

  const availableRoles = mode === 'signup' 
    ? [
        { id: 'Employee', label: 'Employee', badge: 'Tier 3' },
        { id: 'CompanyOwner', label: 'Company Owner', badge: 'Tier 2' },
      ]
    : [
        { id: 'Employee', label: 'Employee', badge: 'Tier 3' },
        { id: 'CompanyOwner', label: 'Company Owner', badge: 'Tier 2' },
        { id: 'SuperAdmin', label: 'SuperAdmin', badge: 'Tier 1' },
      ];

  const handleRoleQuickFill = (selectedRole) => {
    setRole(selectedRole);
    if (mode === 'login') {
      if (selectedRole === 'SuperAdmin') {
        setEmail('admin@grindset.io');
        setPassword('admin123');
      } else if (selectedRole === 'CompanyOwner') {
        setEmail('corp@acmeglobal.com');
        setPassword('company123');
      } else {
        setEmail('john.dev@grindset.io');
        setPassword('employee123');
      }
    }
  };

  // Password validation rules (for signup)
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasMixedCase = hasUpper && hasLower;
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasNumberOrSpecial = hasDigit || hasSpecial;
  const isConfirmMatching = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasMixedCase && hasNumberOrSpecial;

  // Password strength calculation
  const strengthScore = [hasMinLength, hasMixedCase, hasDigit, hasSpecial].filter(Boolean).length;
  const getStrengthInfo = () => {
    if (!password) return { label: '', color: '#8993A4', percent: 0 };
    if (!isPasswordValid) {
      if (strengthScore <= 1) return { label: 'Weak', color: '#EF4444', percent: 25 };
      return { label: 'Moderate', color: '#F59E0B', percent: 50 };
    }
    if (hasDigit && hasSpecial) return { label: 'Very Strong', color: '#059669', percent: 100 };
    return { label: 'Strong', color: '#10B981', percent: 80 };
  };
  const strengthInfo = getStrengthInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetForm();

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (!hasMixedCase) {
        setError('Password must contain a mix of uppercase and lowercase letters.');
        return;
      }
      if (!hasNumberOrSpecial) {
        setError('Password must contain at least one number or special character.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }

      setLoading(true);
      try {
        const payload = {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: role,
          designation: designation,
          hourlyRate: parseFloat(hourlyRate) || 75.0,
          companyName: companyName,
          industry: industry,
          companyId: selectedCompanyId ? parseInt(selectedCompanyId) : null
        };

        const res = await api.signup(payload);
        setSuccessMsg(res.message || 'Account created successfully!');
        if (res.user) {
          localStorage.setItem('grindset_user', JSON.stringify(res.user));
          setTimeout(() => {
            onClose();
            onAuthSuccess(res.user);
          }, 800);
        }
      } catch (err) {
        setError(err.message || 'Registration failed. Please check your information.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }

      setLoading(true);
      try {
        const res = await api.forgotPassword({ email: email.trim().toLowerCase() });
        setSuccessMsg(res.message || 'Password reset link sent! Check your inbox.');
        if (res.devResetUrl) {
          setDevResetUrl(res.devResetUrl);
        }
      } catch (err) {
        setError(err.message || 'Failed to dispatch reset email. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      if (!email.trim() || !password) {
        setError('Please enter both email and password.');
        return;
      }

      setLoading(true);
      try {
        const res = await api.login({ email: email.trim().toLowerCase(), password });
        setSuccessMsg('Logged in successfully!');
        if (res.user) {
          localStorage.setItem('grindset_user', JSON.stringify(res.user));
          setTimeout(() => {
            onClose();
            onAuthSuccess(res.user);
          }, 800);
        }
      } catch (err) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const textPrimary = isDark ? '#F4F5F7' : '#091E42';
  const textMuted = isDark ? '#8993A4' : '#5E6C84';
  const cardBg = isDark ? '#0B1B3D' : '#FFFFFF';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#FAFBFC';
  const border = isDark ? 'rgba(255,255,255,0.1)' : '#DFE1E6';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
    }}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', borderRadius: 24,
          background: cardBg, border: `1px solid ${border}`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0052CC, #6554C0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: textPrimary, margin: 0 }}>GrindSet Access Control</h3>
              <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>
                {mode === 'signup' ? 'Create your 3-tier RBC ERP account' : mode === 'forgot' ? 'Account recovery via secure SMTP email' : 'Sign in to access your dashboard'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Mode Selector Tabs (Sign Up vs Sign In vs Recovery) */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: mode === 'forgot' ? '1fr' : '1fr 1fr', gap: 6, padding: 4,
            borderRadius: 12, background: isDark ? '#172B4D' : '#F0F2F5', border: `1px solid ${border}`
          }}>
            {mode === 'forgot' ? (
              <div style={{
                padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 700, textAlign: 'center',
                background: '#0052CC', color: 'white'
              }}>
                🔑 Forgot Password Recovery
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  style={{
                    padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: mode === 'signup' ? '#0052CC' : 'transparent',
                    color: mode === 'signup' ? 'white' : textMuted, transition: 'all .15s'
                  }}>
                  Create Account (Sign Up)
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  style={{
                    padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: mode === 'login' ? '#0052CC' : 'transparent',
                    color: mode === 'login' ? 'white' : textMuted, transition: 'all .15s'
                  }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10,
              background: 'rgba(222, 53, 11, 0.12)', border: '1px solid rgba(222, 53, 11, 0.3)', color: '#FFBDAD', fontSize: 12
            }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#FF8F73' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10,
              background: 'rgba(54, 179, 126, 0.12)', border: '1px solid rgba(54, 179, 126, 0.3)', color: '#ABF5D1', fontSize: 12
            }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#57D9A3' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role selector */}
          {mode !== 'forgot' && (
            <div>
              <label className="gs-label" style={{ color: textMuted, marginBottom: 6, display: 'block', fontSize: 12, fontWeight: 700 }}>
                Select System Role (3-Tier RBAC)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${availableRoles.length}, 1fr)`, gap: 6 }}>
                {availableRoles.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleQuickFill(r.id)}
                    style={{
                      padding: '8px 4px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                      border: role === r.id ? '2px solid #0052CC' : `1px solid ${border}`,
                      background: role === r.id ? (isDark ? 'rgba(0,82,204,0.25)' : 'rgba(0,82,204,0.08)') : inputBg,
                      transition: 'all .15s'
                    }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: role === r.id ? '#4C9AFF' : textPrimary }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>{r.badge}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'forgot' ? (
            /* Fields for FORGOT PASSWORD */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: textMuted, margin: 0, lineHeight: 1.5 }}>
                Enter the email address associated with your GrindSet account. We will send a secure password reset link via SMTP.
              </p>
              <div>
                <label className="gs-label" style={{ color: textMuted }}>Registered Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                  <input
                    type="email"
                    required
                    placeholder="name@grindset.io"
                    className="gs-input"
                    style={{ paddingLeft: 38, background: inputBg, color: textPrimary, borderColor: border }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {devResetUrl && (
                <div style={{
                  padding: '12px 14px', borderRadius: 12,
                  background: isDark ? 'rgba(0, 82, 204, 0.2)' : 'rgba(0, 82, 204, 0.08)',
                  border: '1px solid rgba(0, 82, 204, 0.4)'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4C9AFF', marginBottom: 4 }}>
                    🚀 Developer Sandbox Shortcut (Local Test):
                  </div>
                  <a
                    href={devResetUrl}
                    onClick={() => onClose()}
                    style={{ fontSize: 12, color: '#DEEBFF', textDecoration: 'underline', wordBreak: 'break-all' }}>
                    Click here to open Reset Password page directly &rarr;
                  </a>
                </div>
              )}
            </div>
          ) : mode === 'signup' ? (
            <>
              {/* Full Name */}
              <div>
                <label className="gs-label" style={{ color: textMuted }}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Vance"
                    className="gs-input"
                    style={{ paddingLeft: 38, background: inputBg, color: textPrimary, borderColor: border }}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="gs-label" style={{ color: textMuted }}>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                  <input
                    type="email"
                    required
                    placeholder="alex@enterprise.io"
                    className="gs-input"
                    style={{ paddingLeft: 38, background: inputBg, color: textPrimary, borderColor: border }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Role specific fields */}
              {role === 'Employee' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="gs-label" style={{ color: textMuted }}>Select Organization *</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                      <select
                        className="gs-input"
                        style={{ paddingLeft: 38, background: inputBg, color: textPrimary, borderColor: border, width: '100%', cursor: 'pointer' }}
                        value={selectedCompanyId}
                        onChange={e => setSelectedCompanyId(e.target.value)}
                        required
                      >
                        {companyList.length > 0 ? (
                          companyList.map(c => (
                            <option key={c.companyId} value={c.companyId} style={{ background: inputBg, color: textPrimary }}>
                              {c.companyName} ({c.industry || 'Enterprise'})
                            </option>
                          ))
                        ) : (
                          <option value="1" style={{ background: inputBg, color: textPrimary }}>Acme Global Technologies</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="gs-label" style={{ color: textMuted }}>Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Engineer"
                      className="gs-input"
                      style={{ background: inputBg, color: textPrimary, borderColor: border }}
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="gs-label" style={{ color: textMuted }}>Hourly Rate ($)</label>
                    <input
                      type="number"
                      placeholder="85"
                      className="gs-input"
                      style={{ background: inputBg, color: textPrimary, borderColor: border }}
                      value={hourlyRate}
                      onChange={e => setHourlyRate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {role === 'CompanyOwner' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="gs-label" style={{ color: textMuted }}>Company Name</label>
                    <input
                      type="text"
                      placeholder="Nexus Tech Ltd"
                      className="gs-input"
                      style={{ background: inputBg, color: textPrimary, borderColor: border }}
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="gs-label" style={{ color: textMuted }}>Industry</label>
                    <input
                      type="text"
                      placeholder="Software & Fintech"
                      className="gs-input"
                      style={{ background: inputBg, color: textPrimary, borderColor: border }}
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="gs-label" style={{ color: textMuted }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="gs-input"
                      style={{ paddingLeft: 38, paddingRight: 36, background: inputBg, color: textPrimary, borderColor: border }}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted, padding: 2, display: 'flex', alignItems: 'center'
                      }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="gs-label" style={{ color: textMuted }}>Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="gs-input"
                      style={{ paddingLeft: 38, paddingRight: 36, background: inputBg, color: textPrimary, borderColor: border }}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted, padding: 2, display: 'flex', alignItems: 'center'
                      }}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength & Requirements Checklist (Sign Up only) */}
              {password.length > 0 && (
                <div style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F4F5F7',
                  border: `1px solid ${border}`
                }}>
                  {/* Strength Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: textMuted }}>Password Strength:</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: strengthInfo.color }}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.1)' : '#DFE1E6', overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{
                      width: `${strengthInfo.percent}%`, height: '100%',
                      background: strengthInfo.color, transition: 'all 0.3s ease'
                    }} />
                  </div>

                  {/* Requirements List */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: hasMinLength ? '#10B981' : textMuted }}>
                      {hasMinLength ? (
                        <Check className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', margin: '0 4px', flexShrink: 0 }} />
                      )}
                      <span style={{ fontWeight: hasMinLength ? 600 : 400 }}>At least 8 characters</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: hasMixedCase ? '#10B981' : textMuted }}>
                      {hasMixedCase ? (
                        <Check className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', margin: '0 4px', flexShrink: 0 }} />
                      )}
                      <span style={{ fontWeight: hasMixedCase ? 600 : 400 }}>Capital & small letters</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: hasNumberOrSpecial ? '#10B981' : textMuted }}>
                      {hasNumberOrSpecial ? (
                        <Check className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', margin: '0 4px', flexShrink: 0 }} />
                      )}
                      <span style={{ fontWeight: hasNumberOrSpecial ? 600 : 400 }}>Number or special character</span>
                    </div>

                    {confirmPassword.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isConfirmMatching ? '#10B981' : '#EF4444' }}>
                        {isConfirmMatching ? (
                          <Check className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                        ) : (
                          <X className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: isConfirmMatching ? 600 : 400 }}>{isConfirmMatching ? 'Passwords match' : 'Passwords must match'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Fields for SIGN IN */
            <>
              <div>
                <label className="gs-label" style={{ color: textMuted }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                  <input
                    type="email"
                    required
                    placeholder="name@grindset.io"
                    className="gs-input"
                    style={{ paddingLeft: 38, background: inputBg, color: textPrimary, borderColor: border }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="gs-label" style={{ color: textMuted, margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccessMsg('');
                    }}
                    style={{
                      background: 'none', border: 'none', color: '#4C9AFF', fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', padding: 0
                    }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="gs-input"
                    style={{ paddingLeft: 38, paddingRight: 36, background: inputBg, color: textPrimary, borderColor: border }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted, padding: 2, display: 'flex', alignItems: 'center'
                    }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, marginTop: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'wait' : 'pointer'
            }}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'signup' ? 'Creating Account & DB Records...' : mode === 'forgot' ? 'Dispatching Reset Email...' : 'Authenticating...'}
              </>
            ) : (
              <>
                {mode === 'signup' ? `Sign Up as ${role}` : mode === 'forgot' ? 'Send Password Reset Link' : `Sign In as ${role}`}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              style={{
                background: 'none', border: 'none', color: '#4C9AFF', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', textAlign: 'center', padding: '6px 0'
              }}>
              &larr; Back to Sign In
            </button>
          )}
        </form>

      </motion.div>
    </div>
  );
}
