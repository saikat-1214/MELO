import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/shared/api/client';
import { ActivityListResponse, CategorySummary } from '@/shared/types/activity';
import { PublicLandmarkMap } from '@/shared/components/PublicLandmarkMap';
import {
  Compass,
  Sparkles,
  PlusCircle,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  Search,
  Users,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  LayoutGrid,
  Map as MapIcon,
} from 'lucide-react';

interface BackendHealth {
  status: string;
  service: string;
  version: string;
  environment: string;
  database: {
    connected: boolean;
    latency_ms: number;
    message: string;
  };
}

export const DiscoverPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // 1. Live health query to the backend
  const { data: health, isLoading: isHealthLoading } = useQuery<BackendHealth>({
    queryKey: ['backend-health'],
    queryFn: async () => {
      const res = await apiClient.get<BackendHealth>('/health');
      return res.data;
    },
    refetchInterval: 15000,
  });

  // 2. Fetch categories
  const { data: remoteCategories } = useQuery<CategorySummary[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get<CategorySummary[]>('/categories');
      return res.data;
    },
  });

  // Standard category pill choices
  const categoryPills = [
    { id: 'all', name: 'All Outings', icon: '✨' },
    ...(remoteCategories || [
      { id: 'festivals', name: 'Festivals & Culture', icon: '🪔', slug: 'festivals' },
      { id: 'sports', name: 'Sports & Fitness', icon: '⚽', slug: 'sports' },
      { id: 'travel', name: 'Travel & Outdoors', icon: '🏔️', slug: 'travel' },
      { id: 'food', name: 'Food & Cafés', icon: '☕', slug: 'food' },
      { id: 'gaming', name: 'Gaming & Tech', icon: '🎮', slug: 'gaming' },
    ]),
  ];

  // 3. Fetch activities
  const {
    data: activitiesData,
    isLoading: isActivitiesLoading,
  } = useQuery<ActivityListResponse>({
    queryKey: ['activities', selectedCategory, searchTerm, selectedCity],
    queryFn: async () => {
      const params: Record<string, any> = {
        status: 'PUBLISHED',
      };
      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (selectedCity.trim()) {
        params.city = selectedCity.trim();
      }
      const res = await apiClient.get<ActivityListResponse>('/activities', { params });
      return res.data;
    },
  });

  const activities = activitiesData?.items || [];

  const formatCardDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCardTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Immersive Modern Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#321044] via-[#481961] to-[#7137A8] p-8 sm:p-12 lg:p-16 text-white shadow-2xl border border-[#321044]">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#FF9B32]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#9B51CA]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-md border border-white/15">
            <span className="flex h-2 w-2 rounded-full bg-[#FF9B32] animate-pulse" />
            <span className="text-[#FF9B32] font-bold">Platonic &amp; Activity-First</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-200">Not A Dating Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Find companions for the experiences{' '}
            <span className="bg-gradient-to-r from-[#FF9B32] via-[#FFAF59] to-[#FFF1E3] bg-clip-text text-transparent">
              you love.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-normal max-w-2xl leading-relaxed">
            From festival pandal hopping and stadium football matches to mountain treks and café visits — never miss an adventure simply because your friends are unavailable.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/activities/create"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#FF9B32] hover:bg-[#F28B20] text-slate-950 px-6 py-3.5 text-sm font-bold shadow-lg shadow-[#FF9B32]/25 active:scale-95 transition-all duration-200"
            >
              <PlusCircle className="h-5 w-5 text-slate-950" />
              Organize a Meetup
            </Link>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 transition-all duration-200"
            >
              <Sparkles className="h-5 w-5 text-[#FF9B32]" />
              Try AI Matchmaker
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Popular Outings:</span>
            {[
              { label: '🪔 Durga Puja Pandal Hopping', city: 'Kolkata' },
              { label: '⚽ 5-a-side Football Friendly', city: 'Bengaluru' },
              { label: '☕ Café & Book Club', city: 'Mumbai' },
              { label: '📸 Street Photography Walk', city: 'Delhi' },
            ].map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-200"
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Architecture Diagnostic Bar */}
      <section className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-4 shadow-soft">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6 text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">Public Meeting Landmarks Only</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">Host Vetting &amp; Approvals</span>
            </div>
          </div>

          {/* Live Diagnostic Badges */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">
              <Server className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500">API:</span>
              {isHealthLoading ? (
                <span className="text-slate-400">checking...</span>
              ) : health?.status === 'healthy' ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Online
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Degraded
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">
              <Database className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500">DB:</span>
              {isHealthLoading ? (
                <span className="text-slate-400">checking...</span>
              ) : health?.database?.connected ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> PostgreSQL ({health.database.latency_ms}ms)
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> PostgreSQL Standby
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Board & Filters */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by activity name (e.g. Durga Puja, 5-a-side Football, Trek, Café)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm placeholder:text-slate-400 shadow-sm focus:border-[#7137A8] focus:outline-none focus:ring-4 focus:ring-[#7137A8]/10 transition"
            />
          </div>

          {/* City Quick Filter */}
          <div className="relative w-full lg:w-48">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="City (e.g. Kolkata)"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 py-3 text-sm placeholder:text-slate-400 shadow-sm focus:border-[#7137A8] focus:outline-none focus:ring-4 focus:ring-[#7137A8]/10 transition"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#F1F3EF] p-1 rounded-2xl border border-[#E8E7E2] shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-[#7137A8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 text-[#7137A8]" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                viewMode === 'map'
                  ? 'bg-white text-[#7137A8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 text-[#7137A8]" />
              <span>Landmark Map</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categoryPills.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#7137A8] text-white shadow-md shadow-[#7137A8]/20 scale-105'
                  : 'bg-white border border-[#E8E7E2] text-slate-700 hover:border-[#7137A8]/40 hover:bg-[#F1EAF8]/30'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Activity Grid or Empty State */}
        {isActivitiesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-[#7137A8] animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading live activities...</p>
          </div>
        ) : activities.length > 0 ? (
          viewMode === 'map' ? (
            <PublicLandmarkMap activities={activities} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <div
                key={act.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-soft hover:shadow-melo hover:border-[#7137A8]/30 transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                      <span>{act.category.icon}</span>
                      <span>{act.category.name}</span>
                    </span>

                    {act.viewer_status !== 'NONE' && (
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                          act.viewer_status === 'HOST'
                            ? 'bg-purple-100 text-purple-800'
                            : act.viewer_status === 'MEMBER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {act.viewer_status === 'HOST'
                          ? 'You are Host'
                          : act.viewer_status === 'MEMBER'
                          ? 'Joined'
                          : 'Request Pending'}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#7137A8] transition leading-snug line-clamp-2">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Public Landmark */}
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 flex items-center gap-2 text-xs text-slate-700">
                    <MapPin className="h-4 w-4 text-[#FF9B32] shrink-0" />
                    <span className="font-semibold text-slate-900">{act.city}:</span>
                    <span className="truncate text-slate-600">{act.location_landmark}</span>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatCardDate(act.start_time)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {formatCardTime(act.start_time)}
                    </span>
                  </div>

                  {/* Spots remaining progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Users className="h-3.5 w-3.5 text-[#7137A8]" />
                        {act.participant_count} / {act.max_participants} Attending
                      </span>
                      <span className="text-[#7137A8] font-bold">
                        {act.spots_left} spots left
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-[#7137A8] rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (act.participant_count / act.max_participants) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Host Footer & Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#321044] text-xs font-bold text-white">
                      {act.host.avatar_url ? (
                        <img src={act.host.avatar_url} alt={act.host.display_name} className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        act.host.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{act.host.display_name}</p>
                      <p className="text-[10px] text-slate-400">Organizer</p>
                    </div>
                  </div>

                  <Link
                    to={`/activities/${act.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#7137A8] hover:bg-[#5F2D8E] px-3.5 py-2 text-xs font-bold text-white transition shadow-sm shrink-0"
                  >
                    <span>View Outing</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          )
        ) : (
          /* Contextual Empty State */
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-14 text-center shadow-soft">
            <div className="max-w-xl mx-auto space-y-5">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 shadow-inner">
                <Compass className="h-10 w-10 text-emerald-600" />
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold shadow">
                  +
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Be the Spark in Your City
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  No activities found matching your filters. Planning to visit pandals during Durga Puja, organize a weekend football match, or try a new café? Host the activity and let companions find you!
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/activities/create"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Host The First Activity
                </Link>
                <Link
                  to="/recommendations"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Explore AI Matches
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-base">🪔</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">Festival Trails</p>
                  <p className="text-[11px] text-slate-500">Group pandal hopping with fellow culture enthusiasts</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-base">⚽</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">Sports &amp; Fitness</p>
                  <p className="text-[11px] text-slate-500">Never cancel turf football because someone bailed</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <span className="text-base">☕</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">Café Hopping</p>
                  <p className="text-[11px] text-slate-500">Explore hidden gems and specialty brews together</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
