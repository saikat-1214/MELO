import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/shared/api/client';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Users,
  Compass,
  Loader2,
} from 'lucide-react';

interface RecommendationBreakdown {
  interest_score: number;
  schedule_score: number;
  location_score: number;
  category_score: number;
}

interface ActivityRecommendationItem {
  activity: {
    id: string;
    title: string;
    description: string;
    city: string;
    location_landmark: string;
    start_time: string;
    category: {
      name: string;
      icon: string;
    };
    participant_count: number;
    max_participants: number;
    spots_left: number;
  };
  match_score: number;
  match_percentage: number;
  breakdown: RecommendationBreakdown;
  explanations: string[];
}

interface ActivityRecommendationsResponse {
  algorithm_version: string;
  items: ActivityRecommendationItem[];
}

interface PeerRecommendationItem {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  general_location: string;
  age?: number | null;
  bio?: string | null;
  shared_interests: string[];
  match_score: number;
  match_percentage: number;
  breakdown: RecommendationBreakdown;
  explanations: string[];
}

interface PeerRecommendationsResponse {
  algorithm_version: string;
  items: PeerRecommendationItem[];
}

export const RecommendationsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'activities' | 'peers'>('activities');
  const [showTuner, setShowTuner] = useState(false);

  // Interactive Weight Tuning Sliders
  const [interestWeight, setInterestWeight] = useState(40);
  const [scheduleWeight, setScheduleWeight] = useState(30);
  const [locationWeight, setLocationWeight] = useState(20);
  const [categoryWeight, setCategoryWeight] = useState(10);

  // 1. Fetch AI Activity Recommendations
  const { data: actRecData, isLoading: isActLoading } = useQuery<ActivityRecommendationsResponse>({
    queryKey: ['recommended-activities'],
    queryFn: async () => {
      const res = await apiClient.get<ActivityRecommendationsResponse>('/recommendations/activities');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  // 2. Fetch AI Peer Recommendations
  const { data: peerRecData, isLoading: isPeerLoading } = useQuery<PeerRecommendationsResponse>({
    queryKey: ['recommended-peers'],
    queryFn: async () => {
      const res = await apiClient.get<PeerRecommendationsResponse>('/recommendations/peers');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  const totalWeight = interestWeight + scheduleWeight + locationWeight + categoryWeight;

  // Custom re-scoring function when user moves the interactive sliders
  const computeAdjustedScore = (b: RecommendationBreakdown) => {
    if (totalWeight === 0) return 0;
    const raw =
      (b.interest_score * interestWeight +
        b.schedule_score * scheduleWeight +
        b.location_score * locationWeight +
        b.category_score * categoryWeight) /
      totalWeight;
    return Math.round(raw * 100);
  };

  const activityItems = actRecData?.items || [];
  const peerItems = peerRecData?.items || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#321044] via-[#481961] to-[#7137A8] p-8 sm:p-12 text-white shadow-xl border border-[#321044]">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/15 text-[#FFF1E3]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF9B32]" />
            Explainable Activity &amp; Peer Scorer
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Transparent Activity &amp; Peer Matching
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
            MELO calculates interest alignment using objective factors: shared activity categories, mutual schedule overlap, and public venue proximity. Every recommendation shows you exactly <em>why</em> it was suggested.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('activities')}
              className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'activities'
                  ? 'bg-[#FF9B32] text-slate-950 shadow-md shadow-[#FF9B32]/25'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Recommended Activities ({activityItems.length})
            </button>
            <button
              onClick={() => setActiveTab('peers')}
              className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'peers'
                  ? 'bg-[#FF9B32] text-slate-950 shadow-md shadow-[#FF9B32]/25'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Compatible Companions ({peerItems.length})
            </button>
            <button
              onClick={() => setShowTuner(!showTuner)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/15 transition"
            >
              <Sliders className="h-3.5 w-3.5 text-[#FF9B32]" />
              <span>{showTuner ? 'Hide Weight Sliders' : 'Tune Factor Weights'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Weight Tuning Sliders Drawer */}
      {showTuner && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Custom Match Factor Weights
              </h3>
            </div>
            <button
              onClick={() => {
                setInterestWeight(40);
                setScheduleWeight(30);
                setLocationWeight(20);
                setCategoryWeight(10);
              }}
              className="text-[11px] font-semibold text-emerald-600 hover:underline"
            >
              Reset to Defaults (40/30/20/10)
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Adjust how much each factor impacts your match percentages in real time:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Interests Overlap</span>
                <span className="text-emerald-700">{interestWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={interestWeight}
                onChange={(e) => setInterestWeight(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Schedule Overlap</span>
                <span className="text-teal-700">{scheduleWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={scheduleWeight}
                onChange={(e) => setScheduleWeight(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Locality / Proximity</span>
                <span className="text-indigo-700">{locationWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={locationWeight}
                onChange={(e) => setLocationWeight(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Category Preference</span>
                <span className="text-amber-700">{categoryWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={categoryWeight}
                onChange={(e) => setCategoryWeight(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Model Transparency Formula Breakdown Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold">
              ∑
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Heuristic Scoring Formula
              </h3>
              <p className="text-[11px] text-slate-400">
                Score S = 0.40 · S(interests) + 0.30 · S(schedule) + 0.20 · S(locality) + 0.10 · S(category)
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
            Active Version: {actRecData?.algorithm_version || 'v1.0-deterministic'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-3 space-y-1">
            <span className="text-lg font-black text-emerald-700">{interestWeight}%</span>
            <p className="text-[11px] font-bold text-emerald-900">Interest Overlap</p>
            <p className="text-[10px] text-emerald-600">Jaccard common tags</p>
          </div>
          <div className="rounded-2xl bg-teal-50/60 border border-teal-100 p-3 space-y-1">
            <span className="text-lg font-black text-teal-700">{scheduleWeight}%</span>
            <p className="text-[11px] font-bold text-teal-900">Schedule Overlap</p>
            <p className="text-[10px] text-teal-600">Mutual time slots</p>
          </div>
          <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-3 space-y-1">
            <span className="text-lg font-black text-indigo-700">{locationWeight}%</span>
            <p className="text-[11px] font-bold text-indigo-900">Locality</p>
            <p className="text-[10px] text-indigo-600">District proximity</p>
          </div>
          <div className="rounded-2xl bg-amber-50/60 border border-amber-100 p-3 space-y-1">
            <span className="text-lg font-black text-amber-700">{categoryWeight}%</span>
            <p className="text-[11px] font-bold text-amber-900">Category Affinity</p>
            <p className="text-[10px] text-amber-600">Preferred outing types</p>
          </div>
        </div>
      </div>

      {/* Auth Banner if Guest */}
      {!isAuthenticated && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-amber-950">
              Sign In to Personalize Your Matches
            </h3>
            <p className="text-xs text-amber-800">
              AI recommendations calculate similarity between your chosen interests, schedule availability, and preferred city.
            </p>
          </div>
          <Link
            to="/login"
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shrink-0"
          >
            Sign In to Unlock
          </Link>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'activities' ? (
        isActLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
        ) : activityItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activityItems.map((item) => {
              const adjustedScore = computeAdjustedScore(item.breakdown);
              return (
                <div
                  key={item.activity.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft hover:shadow-glow transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header with Match Score Badge */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                        {item.activity.category.icon} {item.activity.category.name}
                      </span>
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>{adjustedScore}% Match</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.activity.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.activity.description}
                    </p>

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs text-slate-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-900">{item.activity.city}:</span>
                      <span className="truncate text-slate-600">{item.activity.location_landmark}</span>
                    </div>

                    {/* Factor Breakdown Bars */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Scoring Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span>Interests</span>
                            <span className="font-bold">{Math.round(item.breakdown.interest_score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${item.breakdown.interest_score * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span>Schedule</span>
                            <span className="font-bold">{Math.round(item.breakdown.schedule_score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${item.breakdown.schedule_score * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span>Location</span>
                            <span className="font-bold">{Math.round(item.breakdown.location_score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${item.breakdown.location_score * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span>Category</span>
                            <span className="font-bold">{Math.round(item.breakdown.category_score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${item.breakdown.category_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explanations */}
                    {item.explanations.length > 0 && (
                      <div className="space-y-1">
                        {item.explanations.map((exp, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      {item.activity.spots_left} spots left
                    </span>
                    <Link
                      to={`/activities/${item.activity.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                    >
                      <span>View Outing</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-soft space-y-4">
            <Compass className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Matched Outings Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              As more activities are created across different categories, our AI service will continuously rank the ones that best fit your profile.
            </p>
            <Link
              to="/activities/create"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Host an Outing
            </Link>
          </div>
        )
      ) : (
        /* Peers Tab */
        isPeerLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
        ) : peerItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {peerItems.map((peer) => {
              const adjustedScore = computeAdjustedScore(peer.breakdown);
              return (
                <div
                  key={peer.user_id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft hover:shadow-glow transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-base font-bold text-white shadow-sm">
                          {peer.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {peer.display_name} {peer.age ? `• ${peer.age} yrs` : ''}
                          </h3>
                          <p className="text-[11px] text-slate-500">{peer.general_location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>{adjustedScore}% Match</span>
                      </div>
                    </div>

                    {peer.bio && (
                      <p className="text-xs text-slate-600 italic">"{peer.bio}"</p>
                    )}

                    {peer.shared_interests.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Shared Hobbies &amp; Interests:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {peer.shared_interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-bold"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Factor Breakdown Bars */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Scoring Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span>Interests</span>
                            <span className="font-bold">{Math.round(peer.breakdown.interest_score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${peer.breakdown.interest_score * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span>Schedule</span>
                            <span className="font-bold">{Math.round(peer.breakdown.schedule_score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${peer.breakdown.schedule_score * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span>Location</span>
                            <span className="font-bold">{Math.round(peer.breakdown.location_score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${peer.breakdown.location_score * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-0.5">
                            <span>Category</span>
                            <span className="font-bold">{Math.round(peer.breakdown.category_score * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${peer.breakdown.category_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explanations */}
                    {peer.explanations.length > 0 && (
                      <div className="space-y-1">
                        {peer.explanations.map((exp, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Platonic Companion
                    </span>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                    >
                      <span>Find Outings Together</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-soft space-y-4">
            <Users className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Matched Companions Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our AI engine matches companions when mutual interests and weekly availability align. Update your profile availability slots to see more matches!
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Update Availability Slots
            </Link>
          </div>
        )
      )}
    </div>
  );
};
