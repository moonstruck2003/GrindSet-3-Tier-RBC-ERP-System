import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Check, Sparkles, ShieldCheck, Zap, 
  ArrowRight, Download, RefreshCw, AlertCircle, 
  CheckCircle2, Clock, Calendar, FileText, X
} from 'lucide-react';
import { api } from '../config/api';
import StripeCheckoutModal from '../components/StripeCheckoutModal';

export default function SubscriptionPage({ lightMode = false }) {
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [companyName, setCompanyName] = useState('Organization');
  const [invoices, setInvoices] = useState([]);
  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly' | 'Yearly'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const cardBg = lightMode ? '#FFFFFF' : '#0D1B36';
  const border = lightMode ? '#DFE1E6' : 'rgba(255,255,255,0.12)';
  const textPri = lightMode ? '#091E42' : '#F4F5F7';
  const textMut = lightMode ? '#5E6C84' : '#8993A4';
  const pageBg = lightMode ? '#F4F5F7' : '#070F1E';
  const tableHeaderBg = lightMode ? '#FAFBFC' : 'rgba(255,255,255,0.02)';

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, currentData, invData] = await Promise.all([
        api.subscriptionPlans().catch(() => []),
        api.currentSubscription().catch(() => null),
        api.subscriptionInvoices().catch(() => [])
      ]);

      setPlans(plansData || []);
      if (currentData) {
        setCurrentSub(currentData.subscription || null);
        setCompanyName(currentData.companyName || 'Organization');
        if (currentData.subscription?.billingCycle) {
          setBillingCycle(currentData.subscription.billingCycle);
        }
      }
      setInvoices(invData || currentData?.invoices || []);
    } catch (err) {
      console.error('Subscription load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCheckout = (plan) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = (updatedSub, newInvoice) => {
    setCurrentSub(updatedSub);
    if (newInvoice) {
      setInvoices(prev => [newInvoice, ...prev]);
    }
    setActionMsg(`Subscription successfully upgraded to ${updatedSub.planTier} (${updatedSub.billingCycle})!`);
    setTimeout(() => setActionMsg(''), 5000);
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your auto-renewal? You will retain all tier features until your current period expires.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.cancelSubscription();
      setCurrentSub(res.subscription);
      setActionMsg('Subscription renewal cancelled. Access remains active through current billing period.');
      setTimeout(() => setActionMsg(''), 5000);
    } catch (err) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentTier = currentSub?.planTier || 'Free';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: textPri, margin: 0 }}>
              Subscription & Billing Portal
            </h1>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 999,
              background: currentTier === 'Enterprise' ? 'rgba(191,154,255,0.15)' : currentTier === 'Pro' ? 'rgba(0,82,204,0.15)' : 'rgba(54,179,126,0.15)',
              color: currentTier === 'Enterprise' ? '#BF9AFF' : currentTier === 'Pro' ? '#4C9AFF' : '#57D9A3',
              border: `1px solid ${currentTier === 'Enterprise' ? 'rgba(191,154,255,0.3)' : currentTier === 'Pro' ? 'rgba(0,82,204,0.3)' : 'rgba(54,179,126,0.3)'}`
            }}>
              Active Plan: {currentTier.toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: 13, color: textMut, margin: '4px 0 0' }}>
            Manage plans, Stripe test payments, billing cycles, and invoices for {companyName}.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={loadData}
          disabled={loading}
          className="btn-ghost"
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 12,
            border: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Billing Status
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            background: 'rgba(54, 179, 126, 0.12)',
            border: '1px solid rgba(54, 179, 126, 0.3)',
            color: '#36B37E',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {actionMsg}
        </motion.div>
      )}

      {/* ── Active Subscription Summary Card ── */}
      {currentSub && (
        <div style={{
          padding: 24,
          borderRadius: 20,
          background: cardBg,
          border: `1px solid ${border}`,
          boxShadow: lightMode ? '0 4px 20px rgba(0,0,0,0.04)' : '0 10px 30px rgba(0,0,0,0.35)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: textMut, letterSpacing: '0.06em' }}>
              Current Subscription
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: textPri, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              {currentSub.planTier} Edition
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: currentSub.status === 'Active' ? 'rgba(54,179,126,0.15)' : 'rgba(255,171,0,0.15)',
                color: currentSub.status === 'Active' ? '#36B37E' : '#FFAB00'
              }}>
                {currentSub.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: textMut, marginTop: 4 }}>
              Payment Method: <span style={{ fontWeight: 600, color: textPri }}>{currentSub.paymentMethod}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: textMut, letterSpacing: '0.06em' }}>
              Billing Cycle & Price
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4C9AFF', marginTop: 4 }}>
              ${currentSub.price}.00 <span style={{ fontSize: 12, color: textMut }}>/ {currentSub.billingCycle.toLowerCase()}</span>
            </div>
            <div style={{ fontSize: 12, color: textMut, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Period: {new Date(currentSub.currentPeriodStart).toLocaleDateString()} – {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            {currentSub.planTier !== 'Enterprise' && (
              <button
                onClick={() => {
                  const targetPlan = plans.find(p => p.id === (currentSub.planTier === 'Free' ? 'Pro' : 'Enterprise')) || plans[1];
                  handleOpenCheckout(targetPlan);
                }}
                className="btn-primary"
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Zap className="w-4 h-4" /> Upgrade Plan Tier
              </button>
            )}

            {currentSub.planTier !== 'Free' && currentSub.status === 'Active' && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="btn-ghost"
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#FF5630',
                  border: '1px solid rgba(255,86,48,0.3)',
                  cursor: 'pointer'
                }}
              >
                Cancel Auto-Renewal
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Billing Cycle Toggle Switch ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: 4,
          borderRadius: 999,
          background: lightMode ? '#E9ECEF' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${border}`
        }}>
          <button
            type="button"
            onClick={() => setBillingCycle('Monthly')}
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: billingCycle === 'Monthly' ? (lightMode ? '#FFFFFF' : '#0052CC') : 'transparent',
              color: billingCycle === 'Monthly' ? (lightMode ? '#091E42' : '#FFFFFF') : textMut,
              boxShadow: billingCycle === 'Monthly' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('Yearly')}
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: billingCycle === 'Yearly' ? (lightMode ? '#FFFFFF' : '#0052CC') : 'transparent',
              color: billingCycle === 'Yearly' ? (lightMode ? '#091E42' : '#FFFFFF') : textMut,
              boxShadow: billingCycle === 'Yearly' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>Annual Billing</span>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: 999,
              background: '#36B37E',
              color: 'white'
            }}>
              SAVE 17%
            </span>
          </button>
        </div>
        <span style={{ fontSize: 11, color: textMut, marginTop: 8 }}>
          All payments run on Stripe Sandbox (Test Mode) · No real charges
        </span>
      </div>

      {/* ── Plan Comparison Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {plans.map((plan) => {
          const price = billingCycle === 'Yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrent = currentTier.toLowerCase() === plan.id.toLowerCase();
          const isPopular = plan.highlight;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              style={{
                borderRadius: 22,
                background: cardBg,
                border: isPopular ? '2px solid #635BFF' : `1px solid ${border}`,
                padding: 26,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: isPopular 
                  ? '0 15px 35px -5px rgba(99, 91, 255, 0.25)' 
                  : (lightMode ? '0 4px 20px rgba(0,0,0,0.04)' : '0 10px 30px rgba(0,0,0,0.25)'),
              }}
            >
              {isPopular && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #635BFF, #0052CC)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 14px',
                  borderRadius: 999,
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 12px rgba(99, 91, 255, 0.35)'
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Card Title & Tagline */}
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: textPri, margin: '0 0 6px' }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: 12, color: textMut, margin: 0, minHeight: 36, lineHeight: 1.4 }}>
                  {plan.tagline}
                </p>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: textPri }}>
                    ${price}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: textMut }}>
                    / {billingCycle === 'Yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {billingCycle === 'Yearly' && price > 0 && (
                  <span style={{ fontSize: 11, color: '#36B37E', fontWeight: 700 }}>
                    Includes 2 free months discount
                  </span>
                )}
              </div>

              {/* Features List */}
              <div style={{ flex: 1, marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: textMut, marginBottom: 12 }}>
                  What's Included:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features?.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: textPri }}>
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" style={{ marginTop: 2 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              {isCurrent ? (
                <button
                  disabled
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    background: lightMode ? '#E9ECEF' : 'rgba(255,255,255,0.06)',
                    color: textMut,
                    border: 'none',
                    cursor: 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Current Active Plan
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenCheckout(plan)}
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    background: isPopular
                      ? 'linear-gradient(135deg, #635BFF, #0052CC)'
                      : (lightMode ? '#0052CC' : '#172B4D'),
                    color: 'white',
                    border: isPopular ? 'none' : `1px solid ${border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: isPopular ? '0 4px 15px rgba(99, 91, 255, 0.4)' : 'none'
                  }}
                >
                  <CreditCard className="w-4 h-4" />
                  {price === 0 ? 'Switch to Free Plan' : `Upgrade to ${plan.name}`}
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Invoice & Payment History Table ── */}
      <div style={{
        borderRadius: 20,
        background: cardBg,
        border: `1px solid ${border}`,
        padding: 24,
        boxShadow: lightMode ? '0 4px 20px rgba(0,0,0,0.04)' : '0 10px 30px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText style={{ width: 20, height: 20, color: '#635BFF' }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0 }}>
              Invoice & Payment History
            </h2>
            <span className="pill pill-blue">{invoices.length} Invoices</span>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: textMut, fontSize: 13, background: tableHeaderBg, borderRadius: 12 }}>
            <CreditCard style={{ width: 28, height: 28, color: textMut, margin: '0 auto 8px' }} />
            No paid subscription invoices on file yet. Upgrades via Stripe will automatically generate downloadable invoices here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="gs-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Plan & Frequency</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.invoiceId || inv.InvoiceId}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: textPri }}>
                      {inv.invoiceNumber || inv.InvoiceNumber}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {inv.planName || inv.PlanName}
                    </td>
                    <td style={{ fontWeight: 800, color: '#36B37E' }}>
                      ${inv.amount || inv.Amount}.00 {inv.currency || inv.Currency}
                    </td>
                    <td>
                      <span className="pill pill-green">
                        {inv.status || inv.Status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: textMut }}>
                      {inv.paymentMethod || inv.PaymentMethod}
                    </td>
                    <td style={{ fontSize: 12, color: textMut }}>
                      {new Date(inv.issuedAt || inv.IssuedAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedReceipt(inv)}
                        className="btn-ghost"
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          border: `1px solid ${border}`,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Download className="w-3 h-3" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Stripe Checkout Modal ── */}
      <StripeCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        plan={selectedPlanForCheckout}
        billingCycle={billingCycle}
        companyName={companyName}
        onPaymentSuccess={handlePaymentSuccess}
        lightMode={lightMode}
      />

      {/* ── Receipt View Modal ── */}
      {selectedReceipt && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          background: 'rgba(5, 12, 26, 0.75)',
          backdropFilter: 'blur(8px)'
        }}>
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: '100%',
              maxWidth: 480,
              background: cardBg,
              borderRadius: 20,
              border: `1px solid ${border}`,
              padding: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${border}`, paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: textPri, margin: 0 }}>
                  GrindSet ERP · Tax Receipt
                </h3>
                <span style={{ fontSize: 11, color: textMut }}>Invoice {selectedReceipt.invoiceNumber || selectedReceipt.InvoiceNumber}</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMut }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: textMut }}>Billed To:</span>
                <span style={{ fontWeight: 700, color: textPri }}>{companyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: textMut }}>Plan Item:</span>
                <span style={{ fontWeight: 600, color: textPri }}>{selectedReceipt.planName || selectedReceipt.PlanName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: textMut }}>Payment Processor:</span>
                <span style={{ fontWeight: 600, color: textPri }}>{selectedReceipt.paymentMethod || selectedReceipt.PaymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: textMut }}>Date of Issue:</span>
                <span style={{ color: textPri }}>{new Date(selectedReceipt.issuedAt || selectedReceipt.IssuedAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${border}`, paddingTop: 12, marginTop: 4 }}>
                <span style={{ fontWeight: 800, color: textPri }}>Total Paid:</span>
                <span style={{ fontWeight: 900, color: '#36B37E', fontSize: 18 }}>${selectedReceipt.amount || selectedReceipt.Amount}.00 USD</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                marginTop: 20
              }}
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
