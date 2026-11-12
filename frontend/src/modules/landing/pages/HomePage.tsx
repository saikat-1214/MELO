import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  Smile,
  Coffee,
  Camera,
  Bike,
  Gamepad2,
  Music,
  Map,
} from 'lucide-react';
import { useAuth } from '@/modules/authentication/context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Activity categories with curated imagery
  const categories = [
    {
      name: 'Sports & Fitness',
      description: 'Badminton, football, morning runs & cycling groups',
      icon: Bike,
      image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
      tag: 'Most Active',
      categorySlug: 'Sports & Outdoors',
    },
    {
      name: 'Photography & Film',
      description: 'Golden hour photo walks, street photography & cinema',
      icon: Camera,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      tag: 'Creative',
      categorySlug: 'Arts & Culture',
    },
    {
      name: 'Cafés & Food Crawls',
      description: 'Weekend specialty coffee, street food trails & bakeries',
      icon: Coffee,
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      tag: 'Trending',
      categorySlug: 'Food & Social',
    },
    {
      name: 'Board Games & Esports',
      description: 'Strategy game nights, trivia, LAN games & chess',
      icon: Gamepad2,
      image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
      tag: 'Social',
      categorySlug: 'Tech & Gaming',
    },
    {
      name: 'Music & Live Gigs',
      description: 'Acoustic jam sessions, live concerts & indie festivals',
      icon: Music,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      tag: 'Popular',
      categorySlug: 'Arts & Culture',
    },
    {
      name: 'Travel & Day Treks',
      description: 'Weekend hikes, nature trails & heritage walks',
      icon: Map,
      image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
      tag: 'Adventures',
      categorySlug: 'Sports & Outdoors',
    },
  ];

  // Sample curated real-world activities
  const featuredActivities = [
    {
      id: 'act-1',
      title: 'Weekend Badminton Doubles & Coffee',
      category: 'Sports & Fitness',
      location: 'Salt Lake Sports Complex, Kolkata',
      date: 'This Saturday • 7:30 AM',
      hostName: 'Rahul Sen',
      hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      spots: '3 spots left',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-2',
      title: 'Golden Hour Street Photography Walk',
      category: 'Photography',
      location: 'Victoria Memorial North Gate, Kolkata',
      date: 'This Sunday • 4:00 PM',
      hostName: 'Priya Mukherjee',
      hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      spots: '5 spots left',
      image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'act-3',
      title: 'Cozy Catan & Board Game Evening',
      category: 'Gaming & Social',
      location: 'Roasters Coffee Lab, New Town',
      date: 'Friday • 6:00 PM',
      hostName: 'Amitav Das',
      hostAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      spots: '4 spots left',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="w-full bg-[#F7F7F2] text-[#26232B] overflow-hidden">
      {/* ======================================================== */}
      {/* 1. CINEMATIC VIDEO HERO SECTION */}
      {/* ======================================================== */}
      <section className="relative min-h-[85vh] lg:min-h-[92vh] w-full flex items-center justify-center overflow-hidden bg-[#180A22]">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.05]"
          >
            <source src="/assets/hero/melo-hero.mp4" type="video/mp4" />
          </video>
          {/* Subtle brand color gradient overlay for high editorial readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b0827]/95 via-[#321044]/65 to-[#1b0827]/80" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#180A22]/30 to-[#180A22]/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center text-white">
          {/* Brand pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#FFF1E3] border border-white/20 shadow-lg shadow-black/20 mb-8 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-[#FF9B32]" />
            <span>MEET PEOPLE • SHARE EXPERIENCES</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Find your people. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9B32] via-[#FFAF59] to-[#FFF1E3]">
              Share your world.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base sm:text-xl text-slate-200 font-normal leading-relaxed mb-10">
            Discover real-world activities, meet like-minded companions for badminton, coffee,
            photography, or travel, and turn shared passions into genuine friendships.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#FF9B32] hover:bg-[#F28B20] text-slate-950 px-8 py-4 text-base font-bold shadow-xl shadow-[#FF9B32]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Compass className="h-5 w-5 text-slate-950" />
              Explore Activities
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 text-base font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Join MELO
              </Link>
            ) : (
              <Link
                to="/activities/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 text-base font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Host an Activity
              </Link>
            )}
          </div>

          {/* Subtext and Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#FF9B32]" />
              <span>Strictly Platonic &amp; Non-Dating</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#FF9B32]" />
              <span>100% Public Venues</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#FF9B32]" />
              <span>Verified Community</span>
            </div>
          </div>
        </div>

        {/* Bottom smooth fade to content background */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F7F7F2] to-transparent pointer-events-none" />
      </section>

      {/* ======================================================== */}
      {/* 2. HOW MELO WORKS */}
      {/* ======================================================== */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[#7137A8] bg-[#F1EAF8] px-3.5 py-1.5 rounded-full border border-[#7137A8]/20">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#26232B] tracking-tight mt-4">
            Good things happen when we connect.
          </h2>
          <p className="text-base sm:text-lg text-[#55545C] mt-4 leading-relaxed">
            Finding people who share your interests should feel effortless and natural. MELO replaces awkward small talk with shared, real-world experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 01 */}
          <div className="group rounded-3xl bg-white border border-[#E8E7E2] p-8 shadow-soft hover:shadow-melo hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-extrabold text-[#7137A8] bg-[#F1EAF8] px-3 py-1 rounded-xl">
                  STEP 01
                </span>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#F1EAF8] to-[#FFF1E3] flex items-center justify-center text-[#7137A8]">
                  <Compass className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#26232B] mb-3">
                Discover Your Interests
              </h3>
              <p className="text-sm text-[#55545C] leading-relaxed">
                Explore activities, hobbies and outings matching what you genuinely enjoy — sports, street photography, coffee tasting, books, or gaming.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-[#E8E7E2] flex items-center gap-2 text-xs font-semibold text-[#7137A8] group-hover:translate-x-1 transition-transform">
              <span>Browse open meetups</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 02 */}
          <div className="group rounded-3xl bg-white border border-[#E8E7E2] p-8 shadow-soft hover:shadow-melo hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-extrabold text-[#FF9B32] bg-[#FFF1E3] px-3 py-1 rounded-xl">
                  STEP 02
                </span>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#FFF1E3] to-[#F1EAF8] flex items-center justify-center text-[#FF9B32]">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#26232B] mb-3">
                Meet Like-Minded People
              </h3>
              <p className="text-sm text-[#55545C] leading-relaxed">
                Connect with friendly people in your city who love doing the same things and are open to discovering new experiences together.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-[#E8E7E2] flex items-center gap-2 text-xs font-semibold text-[#FF9B32] group-hover:translate-x-1 transition-transform">
              <span>Smart interest matching</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 03 */}
          <div className="group rounded-3xl bg-white border border-[#E8E7E2] p-8 shadow-soft hover:shadow-melo hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-extrabold text-[#6D8B75] bg-[#EAF0E9] px-3 py-1 rounded-xl">
                  STEP 03
                </span>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#EAF0E9] to-[#F1EAF8] flex items-center justify-center text-[#6D8B75]">
                  <HeartHandshake className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#26232B] mb-3">
                Experience More Together
              </h3>
              <p className="text-sm text-[#55545C] leading-relaxed">
                Gather at designated public venues, participate in the activity, share laughs, and turn fleeting moments into lifelong friendships.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-[#E8E7E2] flex items-center gap-2 text-xs font-semibold text-[#6D8B75] group-hover:translate-x-1 transition-transform">
              <span>Safe public meetups</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. ACTIVITY DISCOVERY SHOWCASE */}
      {/* ======================================================== */}
      <section className="py-20 bg-white border-y border-[#E8E7E2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#7137A8] bg-[#F1EAF8] px-3.5 py-1.5 rounded-full border border-[#7137A8]/20">
                DISCOVER CATEGORIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#26232B] tracking-tight mt-4">
                Something for every kind of passion.
              </h2>
              <p className="text-base text-[#55545C] mt-2">
                From high-energy games to relaxed coffee chats, discover experiences worth sharing.
              </p>
            </div>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#7137A8] hover:text-[#321044] transition"
            >
              <span>View all activities</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.categorySlug)}`)}
                  className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-soft hover:shadow-melo transition-all duration-300"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#26232B]/90 via-[#26232B]/40 to-transparent" />

                  <div className="absolute top-5 left-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#26232B]">
                      <Icon className="h-3.5 w-3.5 text-[#7137A8]" />
                      {cat.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-2xl font-extrabold tracking-tight mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF9B32] group-hover:translate-x-1 transition-transform">
                      <span>Explore {cat.name}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FEATURED ACTIVITY EXPERIENCE */}
      {/* ======================================================== */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[#FF9B32] bg-[#FFF1E3] px-3.5 py-1.5 rounded-full border border-[#FF9B32]/20">
            REAL COMMUNITY OUTINGS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#26232B] tracking-tight mt-4">
            Turn a shared interest into a real experience.
          </h2>
          <p className="text-base sm:text-lg text-[#55545C] mt-4 leading-relaxed">
            Every day, MELO members create and join friendly public meetups. Take a look at upcoming events you can be a part of.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredActivities.map((act) => (
            <article
              key={act.id}
              className="rounded-3xl bg-white border border-[#E8E7E2] overflow-hidden shadow-soft hover:shadow-melo hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3.5 left-3.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#7137A8] shadow-sm">
                    {act.category}
                  </span>
                  <span className="absolute top-3.5 right-3.5 rounded-full bg-[#321044]/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                    {act.spots}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#26232B] line-clamp-1 mb-2">
                    {act.title}
                  </h3>

                  <div className="space-y-2 text-xs text-[#55545C] mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#FF9B32] shrink-0" />
                      <span className="line-clamp-1">{act.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#7137A8] shrink-0" />
                      <span>{act.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E8E7E2]">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={act.hostAvatar}
                        alt={act.hostName}
                        className="h-8 w-8 rounded-full object-cover border border-[#E8E7E2]"
                      />
                      <div>
                        <p className="text-[11px] text-[#85828A]">Hosted by</p>
                        <p className="text-xs font-bold text-[#26232B]">{act.hostName}</p>
                      </div>
                    </div>

                    <Link
                      to="/explore"
                      className="rounded-xl bg-[#F1EAF8] hover:bg-[#7137A8] hover:text-white text-[#7137A8] px-3.5 py-1.5 text-xs font-bold transition-colors"
                    >
                      Join
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#321044] hover:bg-[#481961] text-white px-8 py-3.5 text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Explore all meetups in your city</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. COMMUNITY & AUTHENTIC CONNECTIONS */}
      {/* ======================================================== */}
      <section className="py-20 bg-gradient-to-br from-[#F1EAF8]/50 via-white to-[#FFF1E3]/50 border-y border-[#E8E7E2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#7137A8] bg-white px-3.5 py-1.5 rounded-full border border-[#7137A8]/20">
                FRIENDSHIP-FIRST PLATFORM
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#26232B] tracking-tight mt-4 leading-tight">
                Your interests bring people together.
              </h2>
              <p className="text-base sm:text-lg text-[#55545C] mt-6 leading-relaxed">
                MELO is explicitly designed for genuine companionship, hobby discovery, and community. We believe human connection flourishes best when centered on doing something you love.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-7 w-7 rounded-full bg-[#EAF0E9] text-[#6D8B75] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#26232B]">No Awkward Small Talk</h4>
                    <p className="text-xs text-[#55545C] mt-0.5">
                      You already know you both love photography, running, or gaming before you even meet.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-7 w-7 rounded-full bg-[#FFF1E3] text-[#FF9B32] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#26232B]">Pressure-Free Social Environment</h4>
                    <p className="text-xs text-[#55545C] mt-0.5">
                      No dating swipes, romantic score algorithms, or performance anxiety. Strictly friendly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-7 w-7 rounded-full bg-[#F1EAF8] text-[#7137A8] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#26232B]">Public Venues for Peace of Mind</h4>
                    <p className="text-xs text-[#55545C] mt-0.5">
                      Every meetup takes place at public landmarks, licensed sports grounds, and bustling cafés.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Collage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80"
                  alt="Friends laughing"
                  className="rounded-3xl shadow-md w-full h-56 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80"
                  alt="Group celebration"
                  className="rounded-3xl shadow-md w-full h-64 object-cover"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=600&q=80"
                  alt="Coffee conversation"
                  className="rounded-3xl shadow-md w-full h-64 object-cover"
                />
                <div className="rounded-3xl bg-[#321044] text-white p-6 shadow-md flex flex-col justify-center h-56">
                  <span className="text-3xl font-black text-[#FF9B32]">100%</span>
                  <p className="text-sm font-bold mt-1">Platonic &amp; Inclusive</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    A safe harbor for adults to make real-world friends around common hobbies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. SAFETY & COMMUNITY CHARTER */}
      {/* ======================================================== */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[#6D8B75] bg-[#EAF0E9] px-3.5 py-1.5 rounded-full border border-[#6D8B75]/20">
            SAFETY FIRST
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#26232B] tracking-tight mt-4">
            Better connections start with respect.
          </h2>
          <p className="text-base sm:text-lg text-[#55545C] mt-4 leading-relaxed">
            MELO is built around comfortable, respectful and welcoming social spaces. We design safety into the core of every meetup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl bg-white border border-[#E8E7E2] p-6 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-[#F1EAF8] text-[#7137A8] flex items-center justify-center mb-5">
              <Smile className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#26232B] mb-2">
              Respect Every Individual
            </h3>
            <p className="text-xs text-[#55545C] leading-relaxed">
              Zero tolerance for harassment, romantic solicitation, or discrimination. Friendly and inclusive by design.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E8E7E2] p-6 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-[#FFF1E3] text-[#FF9B32] flex items-center justify-center mb-5">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#26232B] mb-2">
              Public Spaces Only
            </h3>
            <p className="text-xs text-[#55545C] leading-relaxed">
              All meetups must be scheduled at designated cafes, sports grounds, parks, or verified public landmarks.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E8E7E2] p-6 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-[#EAF0E9] text-[#6D8B75] flex items-center justify-center mb-5">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#26232B] mb-2">
              Privacy Shield
            </h3>
            <p className="text-xs text-[#55545C] leading-relaxed">
              Neighborhood and district proximity only. Residential street addresses and flat numbers are never requested.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#E8E7E2] p-6 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-[#F1EAF8] text-[#7137A8] flex items-center justify-center mb-5">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#26232B] mb-2">
              Verified Accounts
            </h3>
            <p className="text-xs text-[#55545C] leading-relaxed">
              Real-time email verification, disposable domain blocking, and community moderation protect authenticity.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            to="/safety"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7137A8] hover:text-[#321044] transition"
          >
            <span>Read full Community Safety Guidelines</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FINAL CALL TO ACTION */}
      {/* ======================================================== */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl my-10">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-[#321044] via-[#481961] to-[#7137A8] text-white p-8 sm:p-14 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-[#321044]/30">
          {/* Subtle decorative circles */}
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#FF9B32]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#9B51CA]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#FF9B32] border border-white/10">
              <Sparkles className="h-3.5 w-3.5" />
              START YOUR JOURNEY TODAY
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Your next connection starts with an experience.
            </h2>

            <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
              Discover something new, meet people who truly understand your hobbies, and make everyday moments richer.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF9B32] hover:bg-[#F28B20] text-slate-950 px-8 py-4 text-base font-bold shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Join MELO for Free
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 text-base font-semibold transition"
              >
                Explore the Community
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
