import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { forgotPassword, verifyOtp, resetPassword } from '../services/authService';
import ThemeToggle from '../components/ThemeToggle';
import './Login.css';
import './ForgotPassword.css';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('OTP has been sent to your email');
      setStep('otp');
    } catch (err: any) {
      setError(err?.message || 'No account found with this email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setSuccess('OTP verified successfully');
      setStep('reset');
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('A new OTP has been sent to your email');
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="login-container">
        <div className="login-icon">
          <Layers size={32} />
        </div>
        <h1 className="login-title">
          {step === 'email' && 'Forgot Password'}
          {step === 'otp' && 'Verify OTP'}
          {step === 'reset' && 'Reset Password'}
        </h1>
        <p className="login-subtitle">
          {step === 'email' && 'Enter your email to receive a verification code'}
          {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
          {step === 'reset' && 'Create your new password'}
        </p>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step === 'email' ? 'active' : 'done'}`}>1</div>
          <div className={`step-line ${step !== 'email' ? 'done' : ''}`} />
          <div className={`step-dot ${step === 'otp' ? 'active' : step === 'reset' ? 'done' : ''}`}>2</div>
          <div className={`step-line ${step === 'reset' ? 'done' : ''}`} />
          <div className={`step-dot ${step === 'reset' ? 'active' : ''}`}>3</div>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="fp-success">{success}</div>}

        {/* Step 1: Enter email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-signin" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">OTP Code</label>
              <div className="input-wrapper">
                <KeyRound size={18} />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-signin" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="btn-resend" onClick={handleResendOtp} disabled={loading}>
              Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: New password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button type="submit" className="btn-signin" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="login-footer-link" style={{ marginTop: '24px' }}>
          <Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
