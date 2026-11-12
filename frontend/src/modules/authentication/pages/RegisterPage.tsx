import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getErrorMessage } from '@/shared/api/client';
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
} from 'lucide-react';

const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getairmail.com',
];

const DOMAIN_TYPOS: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
};

const registerSchema = z
  .object({
    email: z
      .string()
      .email('Please enter a valid email address (e.g. name@domain.com)')
      .refine(
        (val) => {
          const domain = val.split('@')[1]?.toLowerCase().trim();
          return !DISPOSABLE_DOMAINS.includes(domain);
        },
        {
          message: 'Disposable/burner emails are prohibited for community trust and safety.',
        }
      ),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Real-time email domain analysis
  const getEmailFeedback = () => {
    if (!emailValue.includes('@')) return null;
    const parts = emailValue.split('@');
    if (parts.length !== 2) return null;
    const domain = parts[1].toLowerCase().trim();

    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return {
        type: 'disposable' as const,
        message: 'Disposable email detected. Please use a personal email address for meetup accountability.',
      };
    }

    if (DOMAIN_TYPOS[domain]) {
      const suggestedDomain = DOMAIN_TYPOS[domain];
      return {
        type: 'typo' as const,
        suggestedEmail: `${parts[0]}@${suggestedDomain}`,
        message: `Did you mean @${suggestedDomain}?`,
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (emailRegex.test(emailValue)) {
      return {
        type: 'valid' as const,
        message: 'Valid email format',
      };
    }

    return null;
  };

  const emailFeedback = getEmailFeedback();

  const handleApplySuggestion = (suggested: string) => {
    setValue('email', suggested, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerUser(data.email, data.password);
      navigate('/onboarding');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {emailFeedback?.type === 'valid' && !errors.email && (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Valid format
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
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
            </div>

            {/* Real-time typo suggestion */}
            {emailFeedback?.type === 'typo' && (
              <div className="mt-1.5 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-800">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  {emailFeedback.message}
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySuggestion(emailFeedback.suggestedEmail!)}
                  className="font-bold underline text-amber-900 hover:text-amber-950"
                >
                  Change to {emailFeedback.suggestedEmail}
                </button>
              </div>
            )}

            {/* Disposable email warning */}
            {emailFeedback?.type === 'disposable' && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {emailFeedback.message}
              </p>
            )}

            {errors.email && (
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
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create Account &amp; Setup Profile
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
            Email deliverability, disposable domain blocking, and bcrypt security protect community integrity.
          </span>
        </div>
      </div>
    </div>
  );
};
