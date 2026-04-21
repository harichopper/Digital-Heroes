'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Settings, User, Lock, Save, CreditCard, Calendar } from 'lucide-react';
import { swal } from '@/lib/swal';
import { Spinner } from '@/components/Loaders';
import { useGlobalLoader } from '@/components/GlobalLoader';

type SubscriptionInfo = {
  _id: string;
  planType: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  amount: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { withLoading } = useGlobalLoader();
  const [fullName, setFullName] = useState(session?.user?.name || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [billingAction, setBillingAction] = useState<'monthly' | 'yearly' | 'cancel' | null>(null);

  const refreshAccountData = async () => {
    setSubLoading(true);
    const res = await fetch('/api/user/subscription');
    const data = (await res.json()) as {
      subscription?: SubscriptionInfo | null;
      user?: { fullName?: string };
    };

    if (data.user?.fullName) setFullName(data.user.fullName);
    setSubscription(data.subscription || null);
    setSubLoading(false);
  };

  useEffect(() => {
    refreshAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await withLoading(async () => {
      const res = await fetch('/api/user/subscription', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName }) });
      if (res.ok) { await swal.success('Profile Updated!', 'Your name has been saved.'); }
      else { await swal.error('Error', 'Could not update profile'); }
    }, 'Saving profile…');
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { await swal.error('Mismatch', 'Passwords do not match'); return; }
    if (newPass.length < 6) { await swal.warning('Too short', 'Minimum 6 characters'); return; }
    setChangingPass(true);
    await withLoading(async () => {
      const res = await fetch('/api/user/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }) });
      const d = await res.json();
      if (res.ok) { await swal.success('Password Updated!', 'You can now use your new password.'); setCurrentPass(''); setNewPass(''); setConfirmPass(''); }
      else { await swal.error('Error', d.error || 'Failed to change password'); }
    }, 'Updating password…', 'Securing your account');
    setChangingPass(false);
  };

  const startCheckout = async (plan: 'monthly' | 'yearly') => {
    setBillingAction(plan);
    const result = await withLoading(async () => {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      return res.json().then((payload: { url?: string; error?: string }) => ({ ok: res.ok, ...payload }));
    }, 'Creating Stripe checkout…');

    setBillingAction(null);

    if (result.ok && result.url) {
      window.location.href = result.url;
      return;
    }

    await swal.error('Checkout failed', result.error || 'Could not create checkout session.');
  };

  const cancelAtPeriodEnd = async () => {
    const ok = await swal.confirm(
      'Cancel Subscription?',
      'Your subscription will remain active until the end of the current billing period.',
      'Yes, cancel at period end',
      true
    );
    if (!ok) return;

    setBillingAction('cancel');
    const result = await withLoading(async () => {
      const res = await fetch('/api/user/subscription', { method: 'DELETE' });
      const payload = (await res.json()) as { error?: string };
      return { ok: res.ok, ...payload };
    }, 'Cancelling subscription…');

    setBillingAction(null);

    if (!result.ok) {
      await swal.error('Cancellation failed', result.error || 'Could not cancel subscription.');
      return;
    }

    await swal.success('Cancellation scheduled', 'Your plan will end at the end of this billing period.');
    await refreshAccountData();
  };

  const subscriptionLabel = (() => {
    if (!subscription) return 'No active subscription';
    if (subscription.status === 'active') {
      return `${subscription.planType === 'yearly' ? 'Yearly' : 'Monthly'} plan active`;
    }
    if (subscription.status === 'trialing') return 'Trial active';
    if (subscription.status === 'past_due') return 'Payment overdue';
    if (subscription.status === 'cancelled') return 'Cancelled';
    return 'Inactive';
  })();

  const periodEndLabel = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div>
      <div className="dashboard-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Settings size={24} /> Settings</h1>
        <p>Manage your profile and account preferences.</p>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: 640 }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-h4" style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <CreditCard size={18} /> Billing & Subscription
          </h3>

          {subLoading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading subscription details…</p>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Current status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <span className={`badge ${subscription?.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                    {subscription?.status || 'inactive'}
                  </span>
                  <span className="text-sm">{subscriptionLabel}</span>
                </div>
              </div>

              {periodEndLabel && (
                <div style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {subscription?.cancelAtPeriodEnd ? 'Ends on' : 'Renews on'} {periodEndLabel}
                  </span>
                </div>
              )}

              {subscription?.status !== 'active' && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                  <motion.button
                    className="btn btn-primary"
                    onClick={() => startCheckout('monthly')}
                    disabled={billingAction !== null}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {billingAction === 'monthly' ? <><Spinner size={14} color="white" /> Redirecting...</> : 'Subscribe Monthly (£9.99)'}
                  </motion.button>
                  <motion.button
                    className="btn btn-outline"
                    onClick={() => startCheckout('yearly')}
                    disabled={billingAction !== null}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {billingAction === 'yearly' ? <><Spinner size={14} /> Redirecting...</> : 'Subscribe Yearly (£99.90)'}
                  </motion.button>
                </div>
              )}

              {subscription?.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <motion.button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: 'var(--danger-500)', borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={cancelAtPeriodEnd}
                  disabled={billingAction !== null}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {billingAction === 'cancel' ? <><Spinner size={14} /> Cancelling...</> : 'Cancel at period end'}
                </motion.button>
              )}

              {subscription?.cancelAtPeriodEnd && (
                <p className="text-sm" style={{ color: 'var(--warm-400)', marginTop: 'var(--space-2)' }}>
                  Cancellation is already scheduled for the end of your current billing period.
                </p>
              )}
            </>
          )}
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-h4" style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><User size={18} /> Profile</h3>
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input id="name" type="text" className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={session?.user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <span className="form-hint">Email cannot be changed</span>
            </div>
            <motion.button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {saving ? <><Spinner size={14} color="white" /> Saving...</> : <><Save size={16} /> Save Changes</>}
            </motion.button>
          </form>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-h4" style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Lock size={18} /> Change Password</h3>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cur-pass">Current Password</label>
              <input id="cur-pass" type="password" className="form-input" value={currentPass} onChange={e => setCurrentPass(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-pass">New Password</label>
              <input id="new-pass" type="password" className="form-input" placeholder="Min 6 characters" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pass">Confirm Password</label>
              <input id="confirm-pass" type="password" className="form-input" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required minLength={6} />
            </div>
            <motion.button type="submit" className="btn btn-outline" disabled={changingPass} style={{ alignSelf: 'flex-start' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {changingPass ? <><Spinner size={14} /> Updating...</> : <><Lock size={16} /> Update Password</>}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
