import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '@/shared/api/client';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  ShieldCheck,
  MapPin,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Loader2,
  Route,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface ItineraryStop {
  id: string;
  name: string;
  time: string;
  activityNote: string;
}

export const CreateActivityPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categoryId, setCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [generalLocation, setGeneralLocation] = useState('');
  const [publicMeetingPoint, setPublicMeetingPoint] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState<number>(6);
  const [rules, setRules] = useState(
    'Be punctual at the public meeting point. Respect all community members. SocialConnect is strictly for platonic companionship.'
  );
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);

  // Multi-stop festival / outing itinerary builder
  const [showItineraryBuilder, setShowItineraryBuilder] = useState(false);
  const [itineraryStops, setItineraryStops] = useState<ItineraryStop[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddStop = () => {
    setItineraryStops((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        time: '',
        activityNote: '',
      },
    ]);
  };

  const handleRemoveStop = (id: string) => {
    setItineraryStops((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateStop = (id: string, field: keyof ItineraryStop, value: string) => {
    setItineraryStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const loadPresetItinerary = (preset: 'durga-puja' | 'cafe-crawl' | 'photo-walk') => {
    setShowItineraryBuilder(true);
    if (preset === 'durga-puja') {
      setTitle('Durga Puja Pandal Hopping – North Kolkata Heritage');
      setGeneralLocation('North Kolkata');
      setPublicMeetingPoint('Sovabazar Sutanuti Metro Station Gate 2');
      setDescription(
        'Annual Durga Puja heritage hopping trail through traditional aristocrat family pujas (Bonedi Bari) and classic community pandals in North Kolkata. We will explore art installations, hear traditional dhaak rhythms, and sample local autumn sweets.'
      );
      setItineraryStops([
        {
          id: '1',
          name: 'Bagbazar Sarbojanin Pandal',
          time: '04:30 PM',
          activityNote: 'Gather at main entrance & experience traditional idol styling',
        },
        {
          id: '2',
          name: 'Sovabazar Rajbari',
          time: '06:00 PM',
          activityNote: 'Colonial courtyard architecture, dhunuchi naach, and photo session',
        },
        {
          id: '3',
          name: 'Kumartuli Artisan Enclave',
          time: '07:30 PM',
          activityNote: 'Evening tea at Mitra Cafe and seeing master clay artisans at work',
        },
      ]);
    } else if (preset === 'cafe-crawl') {
      setTitle('Bookstore & Heritage Coffee Crawl');
      setGeneralLocation('College Street, Kolkata');
      setPublicMeetingPoint('College Street Coffee House Main Staircase');
      setDescription(
        'An afternoon wandering through heritage book stalls and vintage coffee houses, discovering rare paperbacks and discussing literature over hot infusions.'
      );
      setItineraryStops([
        {
          id: '1',
          name: 'Indian Coffee House',
          time: '03:00 PM',
          activityNote: 'Meet on second floor balcony for infusion & chicken kabiraji',
        },
        {
          id: '2',
          name: 'Boi Para Book Stalls',
          time: '04:30 PM',
          activityNote: 'Browsing second-hand books and poetry collections along Presidency College',
        },
        {
          id: '3',
          name: 'Paramount Sherbets',
          time: '06:00 PM',
          activityNote: 'Historic cold beverages & wrap-up group discussion',
        },
      ]);
    } else if (preset === 'photo-walk') {
      setTitle('Golden Hour Architecture & Ghats Photo Walk');
      setGeneralLocation('BBD Bagh / Strand Road, Kolkata');
      setPublicMeetingPoint('Princep Ghat Monument Arch');
      setDescription(
        'A scenic photography walk capturing Hooghly river sunset reflections, British-era architecture, and riverside boatmen.'
      );
      setItineraryStops([
        {
          id: '1',
          name: 'Princep Ghat Steps',
          time: '04:00 PM',
          activityNote: 'Initial group briefing and Vidyasagar Setu wide-angle shots',
        },
        {
          id: '2',
          name: 'Babughat River Promenade',
          time: '05:15 PM',
          activityNote: 'Golden hour portraits and ferry silhouettes',
        },
        {
          id: '3',
          name: 'Millennium Park Food Pavilion',
          time: '06:30 PM',
          activityNote: 'Review photos together over chai and samosas',
        },
      ]);
    }
  };

  // Fetch categories
  const { data: categories } = useQuery<CategoryItem[]>({
    queryKey: ['activity-categories'],
    queryFn: async () => {
      const res = await apiClient.get<CategoryItem[]>('/categories');
      return res.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!categoryId) {
      setFormError('Please select an activity category.');
      return;
    }
    if (title.trim().length < 5) {
      setFormError('Activity title must be at least 5 characters long.');
      return;
    }
    if (description.trim().length < 15) {
      setFormError('Activity description must be at least 15 characters to explain the plan to potential companions.');
      return;
    }
    if (!generalLocation.trim()) {
      setFormError('Please enter the city or district.');
      return;
    }
    if (publicMeetingPoint.trim().length < 6) {
      setFormError('Please specify a recognizable public meeting point (at least 6 characters, e.g. Metro Gate 1, Stadium entrance).');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Please select both start and end times.');
      return;
    }
    if (new Date(startTime) <= new Date()) {
      setFormError('Start time must be in the future.');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setFormError('End time must be after the start time.');
      return;
    }
    if (!agreedToGuidelines) {
      setFormError('You must agree to the public safety and non-dating community guidelines.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalDescription = description.trim();
      const validStops = itineraryStops.filter((s) => s.name.trim().length > 0);
      if (validStops.length > 0) {
        finalDescription +=
          '\n\n🗺️ Outing Itinerary:\n' +
          validStops
            .map(
              (s, idx) =>
                `📍 Stop ${idx + 1} (${s.time.trim() || 'TBD'}): ${s.name.trim()} — ${s.activityNote.trim() || 'Group visit & exploration'}`
            )
            .join('\n');
      }

      const res = await apiClient.post('/activities', {
        category_id: categoryId,
        title: title.trim(),
        description: finalDescription,
        city: generalLocation.trim(),
        location_landmark: publicMeetingPoint.trim(),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        min_participants: 2,
        max_participants: capacity,
        rules: rules.trim() || undefined,
      });
      navigate(`/activities/${res.data.id}`);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sign In Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You must be signed in with a completed user profile to host activities and lead meetups.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="h-4 w-4" />
          Lead a Community Meetup
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Host a Real-World Activity</h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize an outing for festival visits, sports, treks, or café exploration and connect with companions.
        </p>
      </div>

      {/* Safety Mandatory Notice */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-5 text-xs text-amber-900 flex items-start gap-3.5 shadow-sm">
        <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-amber-950">Mandatory Public Venue Requirement:</strong>
          <p className="text-amber-800 leading-relaxed">
            All meetups must take place at recognizable public meeting landmarks (e.g. Metro Stations, Stadium Gates, Malls). Private homes and residential addresses are strictly prohibited.
          </p>
        </div>
      </div>

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Picker Cards */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            1. Select Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories?.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  categoryId === cat.id
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{cat.icon === 'sparkles' ? '🪔' : cat.icon === 'activity' ? '⚽' : cat.icon === 'compass' ? '🏔️' : cat.icon === 'coffee' ? '☕' : cat.icon === 'gamepad-2' ? '🎮' : '📚'}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title & Description */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            2. Activity Details
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Durga Puja Pandal Hopping – North Kolkata"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the plan, what pandals or spots you'll cover, what to expect, and how the group will explore together..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              ⚡ Quick Outing Ideas &amp; Itineraries:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadPresetItinerary('durga-puja')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
              >
                <span>🪔</span>
                <span>Durga Puja Heritage Trail</span>
              </button>
              <button
                type="button"
                onClick={() => loadPresetItinerary('cafe-crawl')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-200/80 px-3 py-1.5 text-xs font-semibold text-orange-800 hover:bg-orange-100 transition"
              >
                <span>☕</span>
                <span>Coffee House &amp; Books</span>
              </button>
              <button
                type="button"
                onClick={() => loadPresetItinerary('photo-walk')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <span>📷</span>
                <span>Riverside Photo Walk</span>
              </button>
            </div>
          </div>

          {/* Multi-Stop Itinerary Builder Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Multi-Stop Itinerary (Festivals, Trails &amp; Crawls)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!showItineraryBuilder && itineraryStops.length === 0) {
                    handleAddStop();
                  }
                  setShowItineraryBuilder(!showItineraryBuilder);
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                {showItineraryBuilder ? 'Hide Itinerary' : '+ Add Stops'}
              </button>
            </div>

            {showItineraryBuilder && (
              <div className="space-y-3 pt-1">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Map out the sequence of spots (pandals, cafes, landmarks) so companions know the route and timings.
                </p>

                {itineraryStops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-extrabold text-emerald-800">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-700">Stop #{idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(stop.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Landmark name (e.g. Bagbazar Sarbojanin)"
                          value={stop.name}
                          onChange={(e) => handleUpdateStop(stop.id, 'name', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g. 05:00 PM"
                            value={stop.time}
                            onChange={(e) => handleUpdateStop(stop.id, 'time', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Highlight / activity note (e.g. Meet at gate, explore traditional idol & dhaak)"
                      value={stop.activityNote}
                      onChange={(e) => handleUpdateStop(stop.id, 'activityNote', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddStop}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100/60 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Another Stop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Location & Public Landmark */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            3. Where will you meet?
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                General Locality / Area *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={generalLocation}
                  onChange={(e) => setGeneralLocation(e.target.value)}
                  placeholder="e.g. North Kolkata"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Public Meeting Point *
              </label>
              <input
                type="text"
                required
                value={publicMeetingPoint}
                onChange={(e) => setPublicMeetingPoint(e.target.value)}
                placeholder="e.g. Shyambazar Five Point Crossing (Metro Gate 1)"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Capacity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            4. When &amp; Group Size
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Participant Capacity Limit: <span className="text-emerald-700 font-bold">{capacity} members</span>
              </label>
              <span className="text-[11px] text-slate-400">Keep small for cohesive groups (2-20)</span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>

        {/* Conduct Rules & Guidelines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            5. Group Expectations &amp; Guidelines
          </label>
          <textarea
            rows={3}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />

          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToGuidelines}
              onChange={(e) => setAgreedToGuidelines(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I certify that this activity is purely for platonic shared interests and real-world experiences, adheres to public safety rules, and will not be used for commercial solicitation or dating.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Publish Real-World Activity
                <CheckCircle2 className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
