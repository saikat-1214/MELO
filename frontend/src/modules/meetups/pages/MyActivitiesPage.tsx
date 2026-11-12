import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { MyActivitiesOverview } from '@/shared/types/activity';
import {
  Calendar,
  Users,
  PlusCircle,
  Clock,
  Compass,
  MapPin,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyActivitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hosting' | 'joined' | 'requests'>('hosting');

  const { data: overview, isLoading } = useQuery<MyActivitiesOverview>({
    queryKey: ['my-activities-overview'],
    queryFn: async () => {
      const res = await apiClient.get<MyActivitiesOverview>('/activities/my/overview');
      return res.data;
    },
  });

  const hostingList = overview?.hosting || [];
  const joinedList = overview?.joined || [];
  const requestsList = overview?.pending_requests || [];

  const formatSchedule = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })} at ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Meetups &amp; Activities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track activities you are organizing, meetups you've joined, and your submitted participation requests.
          </p>
        </div>
        <Link
          to="/activities/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7137A8] via-[#8541C5] to-[#9B51CA] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#7137A8]/20 hover:from-[#5F2D8E] hover:to-[#7137A8] transition"
        >
          <PlusCircle className="h-4 w-4" />
          Host New Activity
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('hosting')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'hosting'
              ? 'border-[#7137A8] text-[#7137A8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hosting ({hostingList.length})
        </button>
        <button
          onClick={() => setActiveTab('joined')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'joined'
              ? 'border-[#7137A8] text-[#7137A8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Joined Outings ({joinedList.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'requests'
              ? 'border-[#7137A8] text-[#7137A8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Submitted Requests ({requestsList.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-8 w-8 text-[#7137A8] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your activities...</p>
        </div>
      ) : activeTab === 'hosting' ? (
        hostingList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hostingList.map((act) => (
              <div
                key={act.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft hover:shadow-glow transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                      {act.category.icon} {act.category.name}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                        act.status === 'PUBLISHED'
                          ? 'bg-[#F1EAF8] text-[#7137A8] border border-[#7137A8]/30'
                          : act.status === 'FULL'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{act.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{act.description}</p>

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#7137A8] shrink-0" />
                    <span className="font-semibold text-slate-900">{act.city}:</span>
                    <span className="truncate text-slate-600">{act.location_landmark}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatSchedule(act.start_time)}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {act.participant_count} / {act.max_participants} Attending
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="rounded-md bg-[#F1EAF8] px-2 py-1 text-[11px] font-bold text-[#7137A8]">
                    Host Controls
                  </span>
                  <Link
                    to={`/activities/${act.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-[#7137A8] transition"
                  >
                    <span>Manage &amp; Review</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-14 text-center shadow-soft space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1EAF8] text-[#7137A8]">
              <Calendar className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-slate-900">You Are Not Hosting Any Activities Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Have an outing in mind? Create an activity, set a public meeting spot, and vet interested companions who request to join.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/activities/create"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                <PlusCircle className="h-4 w-4" />
                Create Your First Outing
              </Link>
            </div>
          </div>
        )
      ) : activeTab === 'joined' ? (
        joinedList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {joinedList.map((act) => (
              <div
                key={act.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft hover:shadow-glow transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                      {act.category.icon} {act.category.name}
                    </span>
                    <span className="rounded-full bg-[#F1EAF8] px-2.5 py-0.5 text-[10px] font-bold text-[#7137A8] border border-[#7137A8]/30">
                      Confirmed Companion
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{act.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{act.description}</p>

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#7137A8] shrink-0" />
                    <span className="font-semibold text-slate-900">{act.city}:</span>
                    <span className="truncate text-slate-600">{act.location_landmark}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatSchedule(act.start_time)}
                    </span>
                    <span className="text-xs text-slate-500">
                      Host: <strong className="text-slate-800">{act.host.display_name}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    to={`/activities/${act.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-[#7137A8] transition"
                  >
                    <span>View Outing</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-14 text-center shadow-soft space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1EAF8] text-[#7137A8]">
              <Users className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-slate-900">No Upcoming Joined Outings</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse the discovery board to find football matches, festival pandal hopping, or treks happening around your city.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                <Compass className="h-4 w-4" />
                Explore Activities
              </Link>
            </div>
          </div>
        )
      ) : (
        /* Requests Tab */
        requestsList.length > 0 ? (
          <div className="space-y-4">
            {requestsList.map((req) => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft hover:shadow-md transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {req.activity_title || 'Outing Meetup'}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        req.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'ACCEPTED'
                          ? 'bg-[#F1EAF8] text-[#7137A8]'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {req.status === 'PENDING' ? 'Pending Review' : req.status}
                    </span>
                  </div>
                  {req.note && (
                    <p className="text-xs text-slate-600 italic">
                      Your note: "{req.note}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Submitted on {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  to={`/activities/${req.activity_id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <span>View Outing</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-14 text-center shadow-soft space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-slate-900">No Pending Join Requests</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you apply to join an activity, the host reviews your profile and message before granting entry into the confirmed group.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                <Compass className="h-4 w-4" />
                Find Activities to Join
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
};
