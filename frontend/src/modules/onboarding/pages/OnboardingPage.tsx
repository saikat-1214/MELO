import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '@/shared/api/client';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  User,
  MapPin,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { SmartLocationPicker } from '@/shared/components/SmartLocationPicker';

interface InterestItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon_name: string;
}

interface SelectedInterest {
  interest_id: string;
  proficiency_level: number;
}

interface AvailabilitySlot {
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  time_slot: string; // MORNING, AFTERNOON, EVENING, NIGHT
}

const BLOCKED_TERMS = [
  'fuck', 'fuk', 'fvck', 'fck', 'bitch', 'asshole', 'bastard', 'cunt',
  'dick', 'whore', 'slut', 'pussy', 'nazi', 'hitler', 'shit', 'porn', 'sex', 'hookup'
];

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

const currentYear = new Date().getFullYear();
const maxEligibleYear = currentYear - 18; // Must be at least 18
const minEligibleYear = currentYear - 100;
const YEARS = Array.from({ length: maxEligibleYear - minEligibleYear + 1 }, (_, i) => maxEligibleYear - i);

const checkFriendlyName = (name: string): boolean => {
  if (!name.trim()) return true;
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return !BLOCKED_TERMS.some(term => normalized.includes(term));
};

export const OnboardingPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1 State
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('PREFER_NOT_TO_SAY');

  const handleDateChange = (field: 'day' | 'month' | 'year', val: string) => {
    const nextDay = field === 'day' ? val : birthDay;
    const nextMonth = field === 'month' ? val : birthMonth;
    const nextYear = field === 'year' ? val : birthYear;

    if (field === 'day') setBirthDay(val);
    if (field === 'month') setBirthMonth(val);
    if (field === 'year') setBirthYear(val);

    if (nextDay && nextMonth && nextYear) {
      setBirthDate(`${nextYear}-${nextMonth}-${nextDay}`);
    } else {
      setBirthDate('');
    }
  };

  const daysInCurrentMonth = React.useMemo(() => {
    if (!birthMonth) return 31;
    const y = birthYear ? parseInt(birthYear, 10) : 2000;
    const m = parseInt(birthMonth, 10);
    return new Date(y, m, 0).getDate();
  }, [birthYear, birthMonth]);

  const daysList = Array.from({ length: daysInCurrentMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  // Step 2 State
  const [generalLocation, setGeneralLocation] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);

  // Step 3 State: Interests
  const [selectedInterests, setSelectedInterests] = useState<Record<string, number>>({});

  // Step 4 State: Weekly Availability
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { day_of_week: 6, time_slot: 'EVENING' }, // Sat Evening default
    { day_of_week: 0, time_slot: 'MORNING' }, // Sun Morning default
  ]);

  // Fetch standardized interests
  const { data: interestsList, isLoading: isInterestsLoading } = useQuery<InterestItem[]>({
    queryKey: ['interests-list'],
    queryFn: async () => {
      const res = await apiClient.get<InterestItem[]>('/interests');
      return res.data;
    },
  });

  // Calculate age from birthDate
  const calculateAge = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const bday = new Date(dateStr);
    if (isNaN(bday.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - bday.getFullYear();
    const m = today.getMonth() - bday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(birthDate);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = 3; // Default proficiency 3 for backend compatibility
      }
      return copy;
    });
  };

  const toggleAvailabilitySlot = (day: number, slot: string) => {
    setAvailability((prev) => {
      const exists = prev.some((s) => s.day_of_week === day && s.time_slot === slot);
      if (exists) {
        return prev.filter((s) => !(s.day_of_week === day && s.time_slot === slot));
      } else {
        return [...prev, { day_of_week: day, time_slot: slot }];
      }
    });
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your display name.');
        return;
      }
      if (!checkFriendlyName(displayName)) {
        setErrorMsg('Please choose a friendly, welcoming name for community meetups. Abusive or profane terms are not permitted.');
        return;
      }
      if (!birthDate) {
        setErrorMsg('Please enter your date of birth.');
        return;
      }
      if (currentAge === null || currentAge < 18) {
        setErrorMsg('You must be at least 18 years old to join SocialConnect.');
        return;
      }
    } else if (step === 2) {
      if (!generalLocation.trim()) {
        setErrorMsg('Please enter your general city or district name.');
        return;
      }
      if (locationError) {
        setErrorMsg(locationError);
        return;
      }
      const sensitive = ['flat', 'apartment', 'house', 'door no', 'street no', 'road no', 'lane'];
      const hasSensitive = sensitive.some((kw) => generalLocation.toLowerCase().includes(kw));
      if (hasSensitive) {
        setErrorMsg('Please enter only your city or general district (e.g. "Salt Lake, Kolkata"). Street addresses are prohibited for safety.');
        return;
      }
    } else if (step === 3) {
      if (Object.keys(selectedInterests).length === 0) {
        setErrorMsg('Please select at least one interest to enable matching.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleFinish = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const interestsPayload: SelectedInterest[] = Object.entries(selectedInterests).map(
        ([interest_id, proficiency_level]) => ({
          interest_id,
          proficiency_level,
        })
      );

      await apiClient.post('/profiles/onboarding', {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        birth_date: birthDate,
        gender: gender,
        general_location: generalLocation.trim(),
        languages: selectedLanguages,
        interests: interestsPayload,
        availability: availability,
      });

      await refreshUser();
      navigate('/');
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

  // Vibe & Social Intent Categories
  const VIBE_CATEGORIES = [
    {
      title: 'Casual Hangouts & Foodies',
      icon: '☕',
      description: 'Cafés, street food trails, baking, and board games',
      slugs: ['cafe-hopping', 'street-food-trails', 'baking-cooking', 'board-games-chess'],
    },
    {
      title: 'Active & Sports',
      icon: '⚡',
      description: 'Football, cricket, badminton, running, and yoga',
      slugs: ['football', 'cricket', 'badminton', 'running-marathon', 'yoga-wellness'],
    },
    {
      title: 'Adventure & Outdoors',
      icon: '🎒',
      description: 'Mountain treks, road trips, camping, and photography walks',
      slugs: ['weekend-trips', 'trekking-hiking', 'photography-walks', 'camping-stargazing'],
    },
    {
      title: 'Arts, Culture & Heritage',
      icon: '🎭',
      description: 'Festivals, live music, theater, books, art, and cinema',
      slugs: [
        'durga-puja-heritage',
        'cultural-festivals',
        'live-concerts',
        'theater-drama',
        'book-clubs',
        'art-exhibitions',
        'film-appreciation',
      ],
    },
    {
      title: 'Tech & Gaming',
      icon: '💻',
      description: 'Hackathons, tech meetups, and PC/console gaming',
      slugs: ['hackathons-tech', 'pc-console-gaming'],
    },
  ];

  const INTEREST_EMOJIS: Record<string, string> = {
    'durga-puja-heritage': '🪔',
    'live-concerts': '🎸',
    'cultural-festivals': '🎉',
    'theater-drama': '🎭',
    'football': '⚽',
    'cricket': '🏏',
    'badminton': '🏸',
    'running-marathon': '🏃',
    'yoga-wellness': '🧘',
    'weekend-trips': '🚗',
    'trekking-hiking': '🥾',
    'photography-walks': '📷',
    'camping-stargazing': '⛺',
    'cafe-hopping': '☕',
    'street-food-trails': '🍲',
    'baking-cooking': '🍳',
    'board-games-chess': '🎲',
    'pc-console-gaming': '🎮',
    'hackathons-tech': '💻',
    'book-clubs': '📚',
    'art-exhibitions': '🎨',
    'film-appreciation': '🎬',
  };

  // Group interests into Vibe & Social Intent categories
  const categorizedInterests: {
    title: string;
    icon: string;
    description: string;
    items: InterestItem[];
  }[] = [];

  if (interestsList) {
    const placedIds = new Set<string>();

    VIBE_CATEGORIES.forEach((vibe) => {
      const items = interestsList.filter(
        (item) => vibe.slugs.includes(item.slug) && !placedIds.has(item.id)
      );
      items.forEach((it) => placedIds.add(it.id));
      if (items.length > 0) {
        categorizedInterests.push({
          title: vibe.title,
          icon: vibe.icon,
          description: vibe.description,
          items,
        });
      }
    });

    const remaining = interestsList.filter((it) => !placedIds.has(it.id));
    if (remaining.length > 0) {
      categorizedInterests.push({
        title: 'Other Activities',
        icon: '🌟',
        description: 'More community interests',
        items: remaining,
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Step Indicator Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Step {step} of 4</span>
          <span>
            {step === 1 && 'Basic Identity & Age'}
            {step === 2 && 'Location Privacy & Language'}
            {step === 3 && 'Interest Graph'}
            {step === 4 && 'Availability Schedule'}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Basic Identity & Age Verification */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-brand-600" />
                Who are you?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your public display name and verify age eligibility.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Aritra Sengupta"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                About Yourself (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your hobbies, what you enjoy doing on weekends, and what experiences you look forward to..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth * (Must be 18+)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={birthDay}
                    onChange={(e) => handleDateChange('day', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Day</option>
                    {daysList.map((d) => (
                      <option key={d} value={d}>
                        {parseInt(d, 10)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={birthMonth}
                    onChange={(e) => handleDateChange('month', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={birthYear}
                    onChange={(e) => handleDateChange('year', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {currentAge !== null && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    {currentAge >= 18 ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Age: {currentAge} (Eligible)
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> Age: {currentAge} (Must be at least 18)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender Identity
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="NON_BINARY">Non-Binary</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location Privacy & Language */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-600" />
                General Location &amp; Languages
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Where are you based, and which languages do you speak?
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Privacy Shield:</strong> Never enter your residential address, flat number, or street address. Enter only your city or general district (e.g. "Salt Lake, Kolkata" or "North Delhi") to calculate approximate proximity for meetups.
              </div>
            </div>

            <SmartLocationPicker
              initialValue={generalLocation}
              onChange={(formatted) => setGeneralLocation(formatted)}
              onValidityChange={(isValid, err) => setLocationError(isValid ? null : err || 'Location has validation errors')}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['English', 'Bengali', 'Hindi', 'Spanish', 'French', 'Tamil', 'Telugu', 'German'].map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedLanguages((prev) => prev.filter((l) => l !== lang));
                        } else {
                          setSelectedLanguages((prev) => [...prev, lang]);
                        }
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Interest Graph & Social Vibes */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-600" />
                  Select Your Interests
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose the activities and social vibes you love to connect with like-minded companions.
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 transition ${
                  Object.keys(selectedInterests).length > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {Object.keys(selectedInterests).length > 0
                  ? `${Object.keys(selectedInterests).length} selected`
                  : 'Select at least 1'}
              </span>
            </div>

            {isInterestsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              </div>
            ) : categorizedInterests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                No system interests seeded yet. You can still continue to the next step.
              </div>
            ) : (
              <div className="space-y-6 max-h-[460px] overflow-y-auto pr-2">
                {categorizedInterests.map((cat) => (
                  <div key={cat.title} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                          {cat.title}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {cat.items.map((item) => {
                        const isSelected = !!selectedInterests[item.id];
                        const emoji = INTEREST_EMOJIS[item.slug] || '✨';
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => toggleInterest(item.id)}
                            className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/30'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-lg shrink-0">{emoji}</span>
                              <span
                                className={`text-xs font-medium truncate ${
                                  isSelected ? 'text-emerald-950 font-semibold' : 'text-slate-800'
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                            <div className="shrink-0 ml-2">
                              {isSelected ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-slate-300" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Weekly Availability Matrix */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-600" />
                When are you usually free?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select the days and time windows you are typically available for activities.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-semibold text-slate-600">Slot</th>
                    {daysOfWeek.map((day, idx) => (
                      <th key={idx} className="p-2 font-semibold text-slate-700">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot} className="border-t border-slate-100">
                      <td className="p-2 text-left font-medium text-slate-600 capitalize">
                        {slot.toLowerCase()}
                      </td>
                      {daysOfWeek.map((_, dayIdx) => {
                        const isChecked = availability.some(
                          (s) => s.day_of_week === dayIdx && s.time_slot === slot
                        );
                        return (
                          <td key={dayIdx} className="p-2">
                            <button
                              type="button"
                              onClick={() => toggleAvailabilitySlot(dayIdx, slot)}
                              className={`h-7 w-7 rounded-lg border text-xs font-bold transition ${
                                isChecked
                                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {isChecked ? '✓' : ''}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400">
              * The AI service uses this temporal matrix to rank weekend hikes, evening pandal hopping, and stadium matches that align with your free hours.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 transition"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Complete Setup &amp; Explore
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
