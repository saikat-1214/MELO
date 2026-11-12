import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  User,
  MapPin,
  Calendar,
  Languages,
  Sparkles,
  ShieldAlert,
  Loader2,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

interface InterestDetail {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon_name: string;
  proficiency_level: number;
}

interface AvailabilitySlot {
  day_of_week: number;
  time_slot: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  bio: string | null;
  birth_date: string;
  age: number;
  gender: string | null;
  general_location: string;
  languages: string[];
  visibility_scope: string;
  interests: InterestDetail[];
  availability: AvailabilitySlot[];
}

export const ProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await apiClient.get<UserProfile>('/profiles/me');
      return res.data;
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/deactivate');
    },
    onSuccess: () => {
      logout();
    },
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Profile data could not be loaded. Please ensure your session is active.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile.display_name}</h1>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {profile.age} yrs
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5 text-brand-600" />
                {profile.general_location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Languages className="h-4 w-4 text-brand-600" />
            <span>Languages: {profile.languages.join(', ') || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-brand-600" />
            <span>Gender: {profile.gender?.replace(/_/g, ' ') || 'Unspecified'}</span>
          </div>
        </div>
      </div>

      {/* Interests Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-600" />
          Selected Interests &amp; Passion Levels
        </h2>

        {profile.interests.length === 0 ? (
          <p className="text-xs text-slate-500">No interests selected yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.interests.map((interest) => (
              <div
                key={interest.id}
                className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">{interest.name}</span>
                  <span className="rounded bg-brand-100 text-brand-800 px-1.5 py-0.5 text-[10px] font-bold">
                    Level {interest.proficiency_level}/5
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  {interest.category}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability Schedule Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-600" />
          Weekly Availability Schedule
        </h2>

        {profile.availability.length === 0 ? (
          <p className="text-xs text-slate-500">No regular availability specified.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.availability.map((slot, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-medium"
              >
                {daysOfWeek[slot.day_of_week]}: {slot.time_slot}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Safety & Deactivation */}
      <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 space-y-3">
        <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          Privacy &amp; Account Control
        </h3>
        <p className="text-xs text-red-700 leading-relaxed">
          You can deactivate your account at any time. Deactivation immediately invalidates active sessions, hides your profile from community searches, and halts notification delivery.
        </p>
        <button
          onClick={() => setShowDeactivateModal(true)}
          className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
        >
          Deactivate Account
        </button>
      </div>

      {/* Deactivation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h4 className="text-base font-bold text-slate-900">Confirm Deactivation</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to deactivate your SocialConnect account? You will be signed out immediately and your profile will be hidden from other members.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate()}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deactivateMutation.isPending ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
