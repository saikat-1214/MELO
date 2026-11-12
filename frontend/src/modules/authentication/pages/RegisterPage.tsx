import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { apiClient, getErrorMessage } from '@/shared/api/client';
import {
  Users,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  KeyRound,
  RotateCw,
  Check,
} from 'lucide-react';

const registerSchema = z
  .object({
    email: z
      .string()
      .email('Please enter a valid email address (e.g. name@domain.com)'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface EmailCheckResponse {
  is_valid: boolean;
  is_available: boolean;
  normalized_email?: string | null;
  suggestion?: string | null;
  error?: string | null;
}

export const RegisterPage: React.FC = () => {
  const { register: registerUser, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Wizard view state: 'form' | 'verify_otp'
  const [authStep, setAuthStep] = useState<'form' | 'verify_otp'>('form');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Form states
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live pre-flight email check state
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResponse | null>(null);

  // OTP inputs (6 digits)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const emailValue = watch('email') || '';

  // Real-time pre-flight deliverability & availability check via backend
  useEffect(() => {
    const trimmed = emailValue.trim();
    // Only check if it looks like a complete email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setEmailCheckResult(null);
      setIsCheckingEmail(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    // Quiet debounce: don't flag as checking until after user finishes typing
    const timer = setTimeout(async () => {
      try {
        setIsCheckingEmail(true);
        const res = await apiClient.get<EmailCheckResponse>('/auth/check-email', {
          params: { email: trimmed },
          signal: controller.signal,
        });
        if (isMounted) {
          setEmailCheckResult(res.data);
        }
      } catch (err: any) {
        if (err?.name !== 'CanceledError' && err?.name !== 'AbortError') {
          console.warn('Email check error:', err);
        }
      } finally {
        if (isMounted) {
          setIsCheckingEmail(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
      setIsCheckingEmail(false);
    };
  }, [emailValue]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleApplySuggestion = (suggested: string) => {
    setValue('email', suggested, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    // If preflight returned error, block submit
    if (emailCheckResult && !emailCheckResult.is_available) {
      setServerError(emailCheckResult.error || 'This email is already registered.');
      return;
    }
    if (emailCheckResult && !emailCheckResult.is_valid) {
      setServerError(emailCheckResult.error || 'Invalid or undeliverable email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser(data.email, data.password);
      setRegisteredEmail(data.email.trim().toLowerCase());
      if (res?.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setResendCooldown(60);
      setAuthStep('verify_otp');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 1) {
      // Handle paste
      const digits = cleaned.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setOtpError(null);
    setIsVerifyingOtp(true);
    try {
      await verifyOtp(registeredEmail, code);
      navigate('/onboarding');
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleQuickFillOtp = () => {
    if (!devOtp || devOtp.length !== 6) return;
    setOtp(devOtp.split(''));
    otpInputsRef.current[5]?.focus();
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setOtpError(null);
    setResendMessage(null);
    try {
      const res = await resendOtp(registeredEmail);
      if (res?.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setResendCooldown(60);
      setResendMessage(res.message);
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  // ==========================================
  // VIEW 2: 6-DIGIT EMAIL OTP VERIFICATION
  // ==========================================
  if (authStep === 'verify_otp') {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-soft space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 shadow-sm">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              We sent a 6-digit confirmation code to{' '}
              <span className="font-bold text-slate-800">{registeredEmail}</span>.
              Enter it below to verify your inbox.
            </p>
          </div>

          {/* Development Quick-Fill Helper (Active in dev mode when SMTP is not configured) */}
          {devOtp && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/95 p-4 text-xs text-amber-900 shadow-sm flex items-center justify-between gap-3">
              <div>
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Development Quick-Fill Code:
                </p>
                <p className="font-mono text-lg font-extrabold tracking-widest text-amber-950 mt-1">
                  {devOtp}
                </p>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  SMTP is not configured in .env. Click "Fill Code" to auto-fill for testing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickFillOtp}
                className="shrink-0 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 transition"
              >
                Fill Code
              </button>
            </div>
          )}

          {/* Notice to check inbox */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
            <Mail className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-semibold">Check your email inbox or spam folder</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                We've sent an email containing your 6-digit confirmation code. If the email doesn't exist or is unreachable, the code will not arrive.
              </p>
            </div>
          </div>

          {otpError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{otpError}</span>
            </div>
          )}

          {resendMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{resendMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-center text-xs font-semibold text-slate-700 mb-3">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-center gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="h-12 w-11 rounded-xl border border-slate-300 bg-white text-center text-lg font-mono font-bold text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingOtp || otp.join('').length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
            >
              {isVerifyingOtp ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Verify Email &amp; Setup Profile
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-xs text-slate-500">Didn't receive the code?</p>
            <button
              type="button"
              disabled={resendCooldown > 0 || isResending}
              onClick={handleResendOtp}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 transition"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {resendCooldown > 0
                ? `Resend Code in ${resendCooldown}s`
                : 'Resend Verification Code'}
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 text-center">
            <button
              type="button"
              onClick={() => setAuthStep('form')}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              &larr; Use a different email address
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: REGISTRATION FORM WITH LIVE CHECKS
  // ==========================================
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 shadow-sm">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500">
            Join the community to find real-world companions for shared experiences.
          </p>
        </div>

        {serverError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Registration Error</span>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Email Address *
              </label>

              {isCheckingEmail && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="h-2.5 w-2.5 animate-spin text-emerald-600" />
                  Checking...
                </span>
              )}

              {!isCheckingEmail && emailCheckResult?.is_valid && emailCheckResult.is_available && (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Valid email
                </span>
              )}

              {!isCheckingEmail && emailCheckResult && !emailCheckResult.is_available && (
                <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Already registered
                </span>
              )}
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition ${
                  errors.email || (emailCheckResult && (!emailCheckResult.is_valid || !emailCheckResult.is_available))
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
            </div>

            {/* Real-time typo suggestion */}
            {emailCheckResult?.suggestion && (
              <div className="mt-1.5 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-800">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Did you mean {emailCheckResult.suggestion}?
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySuggestion(emailCheckResult.suggestion!)}
                  className="font-bold underline text-amber-900 hover:text-amber-950"
                >
                  Use suggestion
                </button>
              </div>
            )}

            {/* Email deliverability or duplicate error banner */}
            {emailCheckResult && (!emailCheckResult.is_valid || !emailCheckResult.is_available) && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{emailCheckResult.error}</span>
              </p>
            )}

            {errors.email && !emailCheckResult?.error && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                {...register('password')}
                placeholder="At least 8 characters"
                className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Repeat password"
                className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              (emailCheckResult ? (!emailCheckResult.is_valid || !emailCheckResult.is_available) : false)
            }
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create Account &amp; Verify Email
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
            Sign In
          </Link>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3.5 text-[11px] text-slate-500 flex items-center gap-2.5 border border-slate-100">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>
            Real-time MX verification, disposable domain blocking, and 6-digit OTP verification protect community integrity.
          </span>
        </div>
      </div>
    </div>
  );
};
