import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '@/shared/api/client';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { ActivityDetail, JoinRequest } from '@/shared/types/activity';
import { ReportModal } from '@/modules/safety/components/ReportModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  Trash2,
  LogOut,
  UserCheck,
  Route,
} from 'lucide-react';

interface ParsedItineraryStop {
  step: number;
  time: string;
  name: string;
  note: string;
}

const parseItinerary = (
  description: string
): { cleanDescription: string; stops: ParsedItineraryStop[] } => {
  const marker = '🗺️ Outing Itinerary:';
  const idx = description.indexOf(marker);
  if (idx === -1) {
    return { cleanDescription: description, stops: [] };
  }

  const cleanDescription = description.substring(0, idx).trim();
  const itinerarySection = description.substring(idx + marker.length);
  const lines = itinerarySection
    .split('\n')
    .filter((l) => l.trim().startsWith('📍'));

  const stops: ParsedItineraryStop[] = lines.map((line, i) => {
    const timeMatch = line.match(/\((.*?)\):/);
    const time = timeMatch ? timeMatch[1] : '';
    const withoutPrefix = line.replace(/📍\s*Stop\s*\d+\s*\(.*?\):\s*/, '').trim();
    const parts = withoutPrefix.split('—');
    return {
      step: i + 1,
      time,
      name: parts[0]?.trim() || '',
      note: parts[1]?.trim() || '',
    };
  });

  return { cleanDescription, stops };
};

export const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  // Modals & form state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinNote, setJoinNote] = useState('');
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // 1. Fetch Activity Details
  const {
    data: activity,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ActivityDetail>({
    queryKey: ['activity-detail', id],
    queryFn: async () => {
      const res = await apiClient.get<ActivityDetail>(`/activities/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // 2. Fetch Join Requests (Host only)
  const isHost = activity?.viewer_status === 'HOST';
  const { data: requests, refetch: refetchRequests } = useQuery<JoinRequest[]>({
    queryKey: ['activity-requests', id],
    queryFn: async () => {
      const res = await apiClient.get<JoinRequest[]>(`/activities/${id}/requests`);
      return res.data;
    },
    enabled: !!id && isHost,
  });

  // 3. Submit Join Request Mutation
  const joinMutation = useMutation({
    mutationFn: async (note: string) => {
      const res = await apiClient.post(`/activities/${id}/requests`, {
        note: note.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setIsJoinModalOpen(false);
      setJoinNote('');
      setActionSuccess('Your request to join has been submitted! The host will review your request.');
      refetch();
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  // 4. Host Review Decision Mutation
  const decisionMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'ACCEPT' | 'REJECT' }) => {
      const res = await apiClient.post(`/activities/${id}/requests/${requestId}/decision`, {
        action,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      refetch();
      refetchRequests();
      setActionSuccess(`Request ${variables.action === 'ACCEPT' ? 'approved' : 'declined'} successfully.`);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  // 5. Leave Outing Mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/activities/${id}/leave`);
    },
    onSuccess: () => {
      setActionSuccess('You have left this outing.');
      refetch();
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  // 6. Cancel Outing Mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/activities/${id}/cancel`);
    },
    onSuccess: () => {
      setActionSuccess('This activity has been cancelled.');
      refetch();
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading activity details...</p>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Activity Not Found</h2>
        <p className="text-xs text-slate-500">{getErrorMessage(error)}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discovery Board
        </Link>
      </div>
    );
  }

  const formatSchedule = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const dateFormatted = s.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const startTimeStr = s.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = e.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return { dateFormatted, timeRange: `${startTimeStr} – ${endTimeStr}` };
  };

  const schedule = formatSchedule(activity.start_time, activity.end_time);
  const pendingRequestsCount = requests?.filter((r) => r.status === 'PENDING').length || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Back Link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Outings
        </Link>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900">
            &times;
          </button>
        </div>
      )}

      {/* Main Activity Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-soft space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
              {activity.category.icon} {activity.category.name}
            </span>
            <span
              className={`rounded-xl px-3 py-1 text-xs font-bold ${
                activity.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activity.status === 'FULL'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {activity.status === 'PUBLISHED' ? 'Open for Companions' : activity.status}
            </span>
          </div>

          {/* City Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>{activity.city}</span>
          </div>
        </div>

        {/* Title & Description with Itinerary parsing */}
        {(() => {
          const { cleanDescription, stops } = parseItinerary(activity.description);
          return (
            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  {activity.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                  {cleanDescription}
                </p>
              </div>

              {/* Multi-Stop Itinerary Timeline */}
              {stops.length > 0 && (
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/40 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                        <Route className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Planned Outing Itinerary ({stops.length} Stops)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Route planned by host with estimated arrival times
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200">
                    {stops.map((stop) => (
                      <div key={stop.step} className="relative flex items-start gap-3 group">
                        <span className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold ring-4 ring-white shadow-xs">
                          {stop.step}
                        </span>
                        <div className="flex-1 bg-white/80 rounded-xl border border-slate-100 p-3 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              {stop.name}
                            </span>
                            {stop.time && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                <Clock className="h-3 w-3" />
                                {stop.time}
                              </span>
                            )}
                          </div>
                          {stop.note && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {stop.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Public Landmark Safety Banner */}
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <span>Verified Public Meeting Landmark:</span>
              <span className="underline decoration-emerald-400">{activity.location_landmark}</span>
            </p>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              For mutual safety, all SocialConnect meetups are anchored at public landmarks. Never agree to meet at private residences or secluded locations.
            </p>
          </div>
        </div>

        {/* Schedule & Capacity Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span>Date</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{schedule.dateFormatted}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Time</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{schedule.timeRange}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Group Size</span>
              </span>
              <span className="font-bold text-slate-700">
                {activity.participant_count} / {activity.max_participants} Confirmed
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (activity.participant_count / activity.max_participants) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Participants & Host vs Rules & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Attendees and Guidelines */}
        <div className="lg:col-span-2 space-y-8">
          {/* Confirmed Roster */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  Confirmed Participants ({activity.participants.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Companions attending this outing
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {activity.spots_left} spot{activity.spots_left === 1 ? '' : 's'} remaining
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activity.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-slate-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-sm font-black text-white shadow-sm">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt={p.display_name} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      p.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.display_name}</p>
                      {p.role === 'HOST' && (
                        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {p.general_location || 'Community Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines & Rules */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Outing Guidelines &amp; Expectations</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {activity.rules ||
                '1. Arrive on time at the designated public landmark.\n2. Respect all attendees — SocialConnect is strictly for platonic friendship and shared experiences.\n3. Keep group communication transparent.'}
            </p>
          </div>
        </div>

        {/* Right Column (1 Col): Host Profile & Action Center */}
        <div className="space-y-6">
          {/* Organizer Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Activity Organizer
            </span>

            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-lg font-black text-white shadow-md">
                {activity.host.avatar_url ? (
                  <img
                    src={activity.host.avatar_url}
                    alt={activity.host.display_name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  activity.host.display_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{activity.host.display_name}</p>
                <p className="text-xs text-slate-500">
                  {activity.host.general_location}
                  {activity.host.age ? ` • ${activity.host.age} yrs` : ''}
                </p>
                <span className="inline-block mt-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Verified Host
                </span>
              </div>
            </div>

            {activity.host.bio && (
              <p className="text-xs text-slate-600 italic border-t border-slate-100 pt-3">
                "{activity.host.bio}"
              </p>
            )}
          </div>

          {/* Viewer Interactive Action Box */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Participation Status
            </h4>

            {isHost ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-1">
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    You are the Host
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Review join requests and manage your participants.
                  </p>
                </div>

                <button
                  onClick={() => setIsRequestsModalOpen(true)}
                  className="w-full flex items-center justify-between rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <span>Review Join Requests</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold">
                    {pendingRequestsCount} pending
                  </span>
                </button>

                {activity.status !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this activity? All participants will be notified.')) {
                        cancelMutation.mutate();
                      }
                    }}
                    disabled={cancelMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel Activity
                  </button>
                )}
              </div>
            ) : activity.viewer_status === 'MEMBER' ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1 text-emerald-900">
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Confirmed Companion
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    You are attending this activity. Meet at the designated landmark on time!
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to leave this activity? Your spot will be released.')) {
                      leaveMutation.mutate();
                    }
                  }}
                  disabled={leaveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <LogOut className="h-4 w-4 text-slate-500" />
                  Leave Outing
                </button>
              </div>
            ) : activity.viewer_status === 'PENDING_REQUEST' ? (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-1 text-amber-900">
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Request Pending Review
                </p>
                <p className="text-[11px] text-amber-700">
                  Your request has been submitted to {activity.host.display_name}. You will be admitted once the host approves.
                </p>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-3">
                {activity.spots_left > 0 && activity.status === 'PUBLISHED' ? (
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition"
                  >
                    <Send className="h-4 w-4" />
                    Request to Join ({activity.spots_left} spots left)
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-xs font-bold text-slate-400 cursor-not-allowed"
                  >
                    Outing is Full
                  </button>
                )}
                <p className="text-[11px] text-slate-400 text-center">
                  The host will review your profile and greeting note before approving.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <p className="text-xs text-slate-500">
                  Sign in or create a profile to request participation in this outing.
                </p>
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Sign In to Join
                </Link>
              </div>
            )}
          </div>

          {/* Safety & Report Button */}
          <div className="text-center pt-2">
            <button
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Report safety violation or dating attempt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Join Request Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Request to Join Outing</h3>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Send a polite note introducing yourself to <strong>{activity.host.display_name}</strong>. Explain why you'd like to participate!
            </p>

            <textarea
              rows={4}
              value={joinNote}
              onChange={(e) => setJoinNote(e.target.value)}
              placeholder="e.g. Hi! I love football and play regularly. Would love to join the 5-a-side friendly!"
              className="w-full rounded-2xl border border-slate-300 p-3 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => joinMutation.mutate(joinNote)}
                disabled={joinMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                {joinMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Host Review Join Requests Modal */}
      {isRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Join Requests for this Outing</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Approve compatible companions to admit them into the attendee list
                </p>
              </div>
              <button
                onClick={() => setIsRequestsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!requests || requests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No join requests received yet.
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                          {req.requester.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {req.requester.display_name}{' '}
                            {req.requester.age ? `• ${req.requester.age} yrs` : ''}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {req.requester.general_location}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          req.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {req.note && (
                      <div className="rounded-xl bg-white border border-slate-100 p-2.5 text-xs text-slate-700">
                        <span className="font-semibold text-slate-900">Note: </span>"{req.note}"
                      </div>
                    )}

                    {req.requester.interests && req.requester.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {req.requester.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}

                    {req.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          onClick={() =>
                            decisionMutation.mutate({
                              requestId: req.id,
                              action: 'REJECT',
                            })
                          }
                          disabled={decisionMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Decline
                        </button>
                        <button
                          onClick={() =>
                            decisionMutation.mutate({
                              requestId: req.id,
                              action: 'ACCEPT',
                            })
                          }
                          disabled={decisionMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve Companion
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Safety Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportedUserId={activity.host.id}
        activityId={activity.id}
        targetName={`"${activity.title}" (Host: ${activity.host.display_name})`}
      />
    </div>
  );
};
