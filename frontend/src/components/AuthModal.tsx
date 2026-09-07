import React, { useState } from 'react';
import { apiUrl } from '../utils/api';
import { 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

type AuthView = 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const { login } = useAuth();

  const [view, setView] = useState<AuthView>(defaultTab);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword('');
    setOtp('');
    setNewPassword('');
  };

  const switchView = (newView: AuthView) => {
    resetForm();
    setView(newView);
  };

  // Helper to safely parse JSON without throwing "Unexpected end of JSON input" on 404/500 errors
  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {
        error: res.status === 404
          ? 'API service endpoint not reached (404). Ensure backend server is running on http://localhost:5000'
          : `Server returned status ${res.status}: ${res.statusText || 'Unable to process request'}`,
      };
    }
  };

  // 1. Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
        }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || `Registration failed (HTTP ${res.status})`);
      }

      setSuccessMsg(data.message);
      setView('verify-otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || `OTP verification failed (HTTP ${res.status})`);
      }

      login(data.token, data.user);
      setSuccessMsg('Account successfully verified and activated!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || `Failed to resend OTP (HTTP ${res.status})`);
      setSuccessMsg(data.message || 'A new verification code has been dispatched.');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Submit Sign In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        if (data.unverified) {
          setErrorMsg(data.message);
          setView('verify-otp');
          return;
        }
        throw new Error(data.error || `Login failed (HTTP ${res.status})`);
      }

      login(data.token, data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Submit Forgot Password (Request Reset OTP)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || `Request failed (HTTP ${res.status})`);

      setSuccessMsg(data.message);
      setView('reset-password');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Submit Reset Password (with OTP)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || `Password reset failed (HTTP ${res.status})`);

      setSuccessMsg('Your password has been reset! Please sign in with your new password.');
      setTimeout(() => {
        switchView('login');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Header with Brand Badge */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#004b87]/30 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#004b87] to-blue-600 flex items-center justify-center text-white shadow-md border border-white/20">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">
                {view === 'login' && 'Sign In to Portal'}
                {view === 'register' && 'Create Your Account'}
                {view === 'verify-otp' && 'Email Verification'}
                {view === 'forgot-password' && 'Password Recovery'}
                {view === 'reset-password' && 'Set New Password'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {view === 'login' && 'Sign in to access your inquiries, quotes & portal'}
                {view === 'register' && 'Sign up with your email to track quotations & services'}
                {view === 'verify-otp' && 'Enter the 6-digit verification code sent to your email'}
                {view === 'forgot-password' && 'We will send a 6-digit password reset code'}
                {view === 'reset-password' && 'Enter your verification code and set a new password'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors relative z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ---------------- VIEW: SIGN IN ---------------- */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView('forgot-password')}
                    className="text-xs text-[#ea580c] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] bg-white text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-[#004b87] hover:bg-[#003366] shadow-lg shadow-[#004b87]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="text-[#ea580c] font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* ---------------- VIEW: REGISTER ---------------- */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9500087723"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] bg-white text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-[#ea580c] hover:bg-[#c2410c] shadow-lg shadow-[#ea580c]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue & Verify Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-[#004b87] font-bold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ---------------- VIEW: VERIFY EMAIL OTP ---------------- */}
          {view === 'verify-otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
              <div className="w-12 h-12 bg-amber-100 text-[#ea580c] rounded-2xl flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">Check Your Inbox</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  We dispatched a 6-digit verification code to <strong>{email}</strong>. Enter it below to activate:
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-48 mx-auto px-4 py-3 rounded-2xl border-2 border-[#004b87] text-center text-2xl font-black tracking-widest text-[#004b87] bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-[#004b87] hover:bg-[#003366] shadow-lg shadow-[#004b87]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Sign In</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-xs text-slate-600 hover:text-[#ea580c] font-semibold flex items-center justify-center gap-1.5 mx-auto py-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Didn't receive code? Resend OTP</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="text-xs text-slate-500 hover:underline"
                >
                  â† Change Email Address
                </button>
              </div>
            </form>
          )}

          {/* ---------------- VIEW: FORGOT PASSWORD ---------------- */}
          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered account email address. We will dispatch a 6-digit OTP to verify your identity.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] bg-white text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-[#ea580c] hover:bg-[#c2410c] shadow-lg shadow-[#ea580c]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Requesting Code...</span>
                  </>
                ) : (
                  <span>Send Password Reset OTP</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-slate-600 hover:underline font-medium"
                >
                  â† Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ---------------- VIEW: RESET PASSWORD WITH OTP ---------------- */}
          {view === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  6-Digit OTP from Email
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-center text-lg font-black tracking-widest text-[#004b87] bg-white focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] bg-white text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-[#004b87] hover:bg-[#003366] shadow-lg shadow-[#004b87]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset & Update Password</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-slate-600 hover:underline font-medium"
                >
                  â† Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};



