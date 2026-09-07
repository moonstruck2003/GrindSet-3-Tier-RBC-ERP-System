import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Lock, CheckCircle2, AlertCircle, 
  Loader2, X, Sparkles, Building2, ArrowRight 
} from 'lucide-react';
import { api } from '../config/api';

export default function StripeCheckoutModal({ 
  isOpen, 
  onClose, 
  plan, 
  billingCycle = 'Monthly', 
  companyName = 'My Organization',
  onPaymentSuccess, 
  lightMode = false 
}) {
  const [cardholderName, setCardholderName] = useState(companyName || 'Jane Developer');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('424');
  const [postalCode, setPostalCode] = useState('94103');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState(null);

  if (!isOpen || !plan) return null;

  const price = billingCycle === 'Yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const isAnnual = billingCycle === 'Yearly';

  const cardBg = lightMode ? '#FFFFFF' : '#0D1B36';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const inputBg = lightMode ? '#FAFBFC' : 'rgba(255,255,255,0.05)';

  const formatCardNumber = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleQuickFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('424');
    setPostalCode('94103');
    setError('');
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!expiry || !expiry.includes('/')) {
      setError('Please enter expiration in MM/YY format.');
      return;
    }
    if (cvc.length < 3) {
      setError('Please enter a 3 or 4-digit CVC security code.');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate realistic Stripe API round-trip handshake
      await new Promise(r => setTimeout(r, 1200));

      const payload = {
        planTier: plan.id,
        billingCycle: billingCycle,
        cardholderName: cardholderName.trim(),
        cardLast4: cleanCard.slice(-4),
        paymentMethodToken: `tok_stripe_test_${Date.now()}`
      };

      const res = await api.checkoutSubscription(payload);

      setIsSuccess(true);
      setSuccessInvoice(res.invoice);
      if (onPaymentSuccess) {
        onPaymentSuccess(res.subscription, res.invoice);
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'rgba(5, 12, 26, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: cardBg,
          borderRadius: 24,
          border: `1px solid ${border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
        }}
      >
        {/* Stripe-themed Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: lightMode ? 'linear-gradient(135deg, #F8FAFC, #EDF2F7)' : 'linear-gradient(135deg, #0F224A, #0A1733)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #635BFF, #00D4FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 91, 255, 0.35)'
            }}>
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>Stripe Secure Checkout</h3>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 6,
                  background: 'rgba(99, 91, 255, 0.15)',
                  color: '#7A73FF',
                  border: '1px solid rgba(99, 91, 255, 0.3)'
                }}>
                  Test Mode Sandbox
                </span>
              </div>
              <p style={{ fontSize: 11, color: textMut, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock className="w-3 h-3 text-emerald-500" /> 256-bit encrypted test transaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {isSuccess ? (
            /* Success View */
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'rgba(54, 179, 126, 0.15)',
                color: '#36B37E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '2px solid rgba(54, 179, 126, 0.3)'
              }}>
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: textPri, margin: '0 0 6px' }}>
                Subscription Activated!
              </h3>
              <p style={{ fontSize: 13, color: textMut, margin: '0 0 20px', lineHeight: 1.5 }}>
                Your company is now upgraded to the <strong>{plan.name}</strong> ({billingCycle} cycle). All subscription benefits are now active.
              </p>

              {successInvoice && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  background: lightMode ? '#F4F5F7' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${border}`,
                  textAlign: 'left',
                  marginBottom: 24,
                  fontSize: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: textMut }}>Invoice Number:</span>
                    <span style={{ fontWeight: 700, color: textPri }}>{successInvoice.invoiceNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: textMut }}>Amount Charged:</span>
                    <span style={{ fontWeight: 800, color: '#36B37E' }}>${successInvoice.amount}.00 USD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: textMut }}>Payment Method:</span>
                    <span style={{ fontWeight: 600, color: textPri }}>{successInvoice.paymentMethod}</span>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                Return to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Order Summary Pill Card */}
              <div style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: lightMode ? '#F4F5F7' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: textPri }}>{plan.name}</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'rgba(0, 82, 204, 0.15)',
                      color: '#4C9AFF'
                    }}>
                      {billingCycle}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: textMut }}>
                    {isAnnual ? 'Billed annually · 2 months free applied' : 'Renews monthly · Cancel anytime'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#635BFF' }}>
                    ${price}
                    <span style={{ fontSize: 12, fontWeight: 600, color: textMut }}>{isAnnual ? '/yr' : '/mo'}</span>
                  </div>
                  <span style={{ fontSize: 10, color: '#36B37E', fontWeight: 700 }}>$0.00 setup fee</span>
                </div>
              </div>

              {/* Sandbox Auto-fill Helper Banner */}
              <div style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(99, 91, 255, 0.08)',
                border: '1px solid rgba(99, 91, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#635BFF', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: textPri, fontWeight: 600 }}>
                    Testing with Stripe sandbox? Use test credentials.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillTestCard}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 800,
                    background: '#635BFF',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Quick Fill Test Card
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(255, 86, 48, 0.12)',
                  color: '#FF5630',
                  border: '1px solid rgba(255, 86, 48, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              {/* Cardholder Name */}
              <div>
                <label className="gs-label" style={{ color: textMut }}>Company / Cardholder Name</label>
                <div style={{ position: 'relative' }}>
                  <Building2 className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMut }} />
                  <input
                    type="text"
                    required
                    placeholder="Acme Global Inc"
                    className="gs-input"
                    style={{ paddingLeft: 38, background: inputBg, color: textPri, borderColor: border }}
                    value={cardholderName}
                    onChange={e => setCardholderName(e.target.value)}
                  />
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="gs-label" style={{ color: textMut }}>Card Number</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard className="w-4 h-4" style={{ position: 'absolute', left: 12, top: 12, color: textMut }} />
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4242 •••• •••• 4242"
                    className="gs-input"
                    style={{ paddingLeft: 38, fontFamily: 'monospace', letterSpacing: '0.05em', background: inputBg, color: textPri, borderColor: border }}
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  />
                </div>
              </div>

              {/* Expiry, CVC, Postal Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="gs-label" style={{ color: textMut }}>Expires</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    className="gs-input"
                    style={{ textAlign: 'center', background: inputBg, color: textPri, borderColor: border }}
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="gs-label" style={{ color: textMut }}>CVC Code</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="424"
                    className="gs-input"
                    style={{ textAlign: 'center', background: inputBg, color: textPri, borderColor: border }}
                    value={cvc}
                    onChange={e => setCvc(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div>
                  <label className="gs-label" style={{ color: textMut }}>ZIP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="94103"
                    className="gs-input"
                    style={{ textAlign: 'center', background: inputBg, color: textPri, borderColor: border }}
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Pay Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isProcessing}
                style={{
                  padding: '13px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  marginTop: 4,
                  background: 'linear-gradient(135deg, #635BFF, #0052CC)',
                  color: 'white',
                  border: 'none',
                  cursor: isProcessing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 15px rgba(99, 91, 255, 0.4)'
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authorizing with Stripe Sandbox...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Pay ${price}.00 USD with Stripe
                  </>
                )}
              </motion.button>

              <div style={{ textAlign: 'center', fontSize: 11, color: textMut }}>
                <span>🔒 Payments are simulated in Stripe Test Mode. No real funds are charged.</span>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
