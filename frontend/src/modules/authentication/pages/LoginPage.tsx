import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getErrorMessage } from '@/shared/api/client';
import { Users, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setIsSubmitting(true);
    try {
      const isOnboarded = await login(email, password);
      if (!isOnboarded) {
        navigate('/onboarding');
      } else {
        navigate(from, { replace: true });
      }
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F1EAF8] to-[#FFF1E3] text-[#7137A8] shadow-sm border border-[#7137A8]/20">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#26232B] tracking-tight">Sign in to MELO</h1>
          <p className="text-xs text-[#55545C]">
            Discover like-minded companions for real-world activities.
          </p>
        </div>

        {serverError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[#7137A8] focus:outline-none focus:ring-4 focus:ring-[#7137A8]/10 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[#7137A8] focus:outline-none focus:ring-4 focus:ring-[#7137A8]/10 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7137A8] via-[#8541C5] to-[#9B51CA] py-3.5 text-sm font-bold text-white shadow-md shadow-[#7137A8]/25 hover:from-[#5F2D8E] hover:to-[#7137A8] disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-[#7137A8] hover:text-[#5F2D8E]">
            Create an Account
          </Link>
        </div>

        <div className="rounded-2xl bg-[#F1EAF8]/60 p-3.5 text-[11px] text-[#55545C] flex items-center gap-2.5 border border-[#7137A8]/15">
          <ShieldCheck className="h-5 w-5 text-[#7137A8] shrink-0" />
          <span>Passwords securely hashed using bcrypt with rotating JWT tokens.</span>
        </div>
      </div>
    </div>
  );
};
