import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Lock, Eye, EyeOff, Check, X, 
  AlertCircle, CheckCircle2, Loader2, KeyRound, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { api } from '../config/api';

export default function ResetPasswordPage({ lightMode = false }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountRole, setAccountRole] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Form fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resetCompleted, setResetCompleted] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setTokenValid(false);
      setVerifyError('No reset token provided. Please use the link sent to your email.');
      return;
    }

    let isMounted = true;
    setIsVerifying(true);
    setVerifyError('');

    api.verifyResetToken(token)
      .then(res => {
        if (!isMounted) return;
        if (res.valid) {
          setTokenValid(true);
          setAccountEmail(res.email || '');
          setAccountRole(res.role || 'User');
        } else {
          setTokenValid(false);
          setVerifyError(res.message || 'Invalid or expired password reset token.');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setTokenValid(false);
        setVerifyError(err.message || 'Failed to verify token. The reset link may have expired.');
      })
      .finally(() => {
        if (isMounted) setIsVerifying(false);
      });

    return () => { isMounted = false; };
  }, [token]);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasMixedCase = hasUpper && hasLower;
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const hasNumberOrSpecial = hasDigit || hasSpecial;
  const isConfirmMatching = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasMixedCase && hasNumberOrSpecial;

  // Strength score
  const strengthScore = [hasMinLength, hasMixedCase, hasDigit, hasSpecial].filter(Boolean).length;
  const getStrengthInfo = () => {
    if (!newPassword) return { label: '', color: '#8993A4', percent: 0 };
    if (!isPasswordValid) {
      if (strengthScore <= 1) return { label: 'Weak', color: '#EF4444', percent: 25 };
      return { label: 'Moderate', color: '#F59E0B', percent: 50 };
    }
    if (hasDigit && hasSpecial) return { label: 'Very Strong', color: '#059669', percent: 100 };
    return { label: 'Strong', color: '#10B981', percent: 80 };
  };
  const strengthInfo = getStrengthInfo();

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!isPasswordValid) {
      setSubmitError('Please meet all password strength requirements before proceeding.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword({
        token: token.trim(),
        newPassword: newPassword
      });
      setResetCompleted(true);
    } catch (err) {
      setSubmitError(err.message || 'Password reset failed. Token may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color tokens
  const bg = lightMode ? '#F4F5F7' : '#070C18';
  const cardBg = lightMode ? '#FFFFFF' : '#0B1B3D';
  const textPrimary = lightMode ? '#091E42' : '#F4F5F7';
  const textMuted = lightMode ? '#5E6C84' : '#8993A4';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.1)';
  const inputBg = lightMode ? '#FAFBFC' : 'rgba(255,255,255,0.05)';

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          maxWidth: 480,
          background: cardBg,
          borderRadius: 24,
          border: `1px solid ${border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Top Accent Gradient */}
        <div style={{ height: 6, background: 'linear-gradient(90deg, #0052CC, #6554C0, #00B8D9)' }} />

        <div style={{ padding: '32px 28px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #0052CC, #4C9AFF)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(0, 82, 204, 0.3)',
              marginBottom: 16
            }}>
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, margin: '0 0 6px' }}>
              Set New Password
            </h1>
            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
              GrindSet 3-Tier RBC Enterprise Security
            </p>
          </div>

          {/* State 1: Verifying Token */}
          {isVerifying && (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" style={{ color: '#0052CC', marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
                Verifying secure reset token with GrindSet authentication service...
              </p>
            </div>
          )}

          {/* State 2: Invalid / Expired Token */}
          {!isVerifying && !tokenValid && !resetCompleted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                padding: '16px 18px',
                borderRadius: 14,
                background: 'rgba(222, 53, 11, 0.12)',
                border: '1px solid rgba(222, 53, 11, 0.3)',
                color: '#FF8F73',
                fontSize: 13,
                lineHeight: 1.5,
                display: 'flex',
                gap: 12
              }}>
                <ShieldAlert className="w-5 h-5 flex-shrink-0" style={{ marginTop: 2 }} />
                <div>
                  <strong style={{ color: '#FFBDAD', display: 'block', marginBottom: 4 }}>
                    Link Invalid or Expired
                  </strong>
                  {verifyError || 'This reset token has either expired (1-hour limit) or has already been used.'}
                </div>
              </div>

              {/* Fallback Token Input */}
              <div>
                <label className="gs-label" style={{ color: textMuted }}>Paste Reset Token Manually</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <input
                    type="text"
                    placeholder="Enter 64-character token..."
                    className="gs-input"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    style={{ flex: 1, background: inputBg, color: textPrimary, borderColor: border, fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Link
                  to="/"
                  style={{
                    color: '#4C9AFF',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  &larr; Return to GrindSet Homepage
                </Link>
              </div>
            </div>
          )}

          {/* State 3: Reset Completed Successfully */}
          {resetCompleted && (
            <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'rgba(54, 179, 126, 0.15)',
                border: '2px solid #36B37E',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <CheckCircle2 className="w-9 h-9" style={{ color: '#36B37E' }} />
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: textPrimary, margin: '0 0 6px' }}>
                  Password Reset Complete!
                </h3>
                <p style={{ fontSize: 13, color: textMuted, margin: 0, lineHeight: 1.5 }}>
                  Your password has been securely updated. You can now authenticate into your account with your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-primary"
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: 8
                }}
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* State 4: Valid Token - New Password Form */}
          {!isVerifying && tokenValid && !resetCompleted && (
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Account badge */}
              <div style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: lightMode ? 'rgba(0,82,204,0.06)' : 'rgba(0,82,204,0.15)',
                border: '1px solid rgba(0,82,204,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: textMuted }}>Account Identity:</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>{accountEmail}</div>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#0052CC',
                  color: 'white'
                }}>
                  {accountRole}
                </span>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(222, 53, 11, 0.12)',
                  border: '1px solid rgba(222, 53, 11, 0.3)',
                  color: '#FFBDAD',
                  fontSize: 12
                }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#FF8F73' }} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="gs-label" style={{ color: textMuted }}>New Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter at least 8 characters..."
                    className="gs-input"
                    style={{ paddingLeft: 38, paddingRight: 36, background: inputBg, color: textPrimary, borderColor: border }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted, padding: 2, display: 'flex', alignItems: 'center'
                    }}>
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="gs-label" style={{ color: textMuted }}>Confirm New Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMuted }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your new password..."
                    className="gs-input"
                    style={{ paddingLeft: 38, paddingRight: 36, background: inputBg, color: textPrimary, borderColor: border }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              {/* Password Strength & Requirements Checklist */}
              {newPassword.length > 0 && (
                <div style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: lightMode ? '#F4F5F7' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: textMuted }}>Password Strength:</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: strengthInfo.color }}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, borderRadius: 99, background: lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{
                      width: `${strengthInfo.percent}%`, height: '100%',
                      background: strengthInfo.color, transition: 'all 0.3s ease'
                    }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: hasMinLength ? '#10B981' : textMuted }}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5" style={{ flexShrink: 0 }} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', margin: '0 4px', flexShrink: 0 }} />}
                      <span style={{ fontWeight: hasMinLength ? 600 : 400 }}>At least 8 characters</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: hasMixedCase ? '#10B981' : textMuted }}>
                      {hasMixedCase ? <Check className="w-3.5 h-3.5" style={{ flexShrink: 0 }} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', margin: '0 4px', flexShrink: 0 }} />}
                      <span style={{ fontWeight: hasMixedCase ? 600 : 400 }}>Capital & small letters</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: hasNumberOrSpecial ? '#10B981' : textMuted }}>
                      {hasNumberOrSpecial ? <Check className="w-3.5 h-3.5" style={{ flexShrink: 0 }} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', margin: '0 4px', flexShrink: 0 }} />}
                      <span style={{ fontWeight: hasNumberOrSpecial ? 600 : 400 }}>Number or special character</span>
                    </div>

                    {confirmPassword.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isConfirmMatching ? '#10B981' : '#EF4444' }}>
                        {isConfirmMatching ? <Check className="w-3.5 h-3.5" style={{ flexShrink: 0 }} /> : <X className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />}
                        <span style={{ fontWeight: isConfirmMatching ? 600 : 400 }}>{isConfirmMatching ? 'Passwords match' : 'Passwords must match'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !isPasswordValid || !isConfirmMatching}
                className="btn-primary"
                style={{
                  padding: '12px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: (isSubmitting || !isPasswordValid || !isConfirmMatching) ? 'not-allowed' : 'pointer',
                  opacity: (!isPasswordValid || !isConfirmMatching) ? 0.6 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Update Password</span>
                  </>
                )}
              </motion.button>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
