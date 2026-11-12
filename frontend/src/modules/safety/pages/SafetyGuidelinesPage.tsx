import React from 'react';
import {
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Users,
  HeartHandshake,
  Eye,
  PhoneCall,
} from 'lucide-react';

export const SafetyGuidelinesPage: React.FC = () => {
  const rules = [
    {
      title: 'Always Meet at Public Landmarks',
      desc: 'All activities mandate recognizable public meeting spots (e.g. Metro Gates, Malls, Stadium Box Offices). Never agree to meet at private residential homes or secluded areas.',
      icon: MapPin,
      badge: 'Mandatory',
      badgeColor: 'bg-[#F1EAF8] text-[#7137A8]',
    },
    {
      title: 'Strictly Platonic Friendship',
      desc: 'MELO is purpose-built for shared real-world hobbies, not dating. Romantic advances, harassment, and unsolicited private messages result in immediate account termination.',
      icon: HeartHandshake,
      badge: 'Zero Tolerance',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      title: 'Vetted Host Approval',
      desc: 'Hosts review applicant profiles and request notes before granting entry into group chats. You have total authority over who attends your activities.',
      icon: Users,
      badge: 'Control',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'Independent Transportation',
      desc: 'Always arrange your own transit to and from the meetup venue. Never rely on an unfamiliar participant for a ride home.',
      icon: Eye,
      badge: 'Safety First',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'Inform Friends or Family',
      desc: 'Before attending a meetup, share the event details, public meeting landmark, and estimated return time with a trusted friend or family member.',
      icon: PhoneCall,
      badge: 'Best Practice',
      badgeColor: 'bg-sky-100 text-sky-800',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 pb-16">
      {/* Header */}
      <div className="border-b border-[#E8E7E2] pb-6">
        <div className="inline-flex items-center gap-2 text-[#7137A8] text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-5 w-5 text-[#7137A8]" />
          Community Trust &amp; Safety Charter
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#26232B] tracking-tight">
          Safety Standards &amp; Code of Conduct
        </h1>
        <p className="text-sm sm:text-base text-[#55545C] mt-2 leading-relaxed">
          Your physical security and emotional comfort are paramount. MELO enforces rigorous standards so everyone can enjoy real-world companionship safely.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-[#E8E7E2] bg-white p-6 shadow-soft space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-[#F1EAF8] text-[#7137A8] flex items-center justify-center border border-[#7137A8]/20">
                  <Icon className="h-5 w-5 text-[#7137A8]" />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${rule.badgeColor}`}>
                  {rule.badge}
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{rule.title}</h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Moderation Workflow & Reporting Card */}
      <div className="rounded-3xl border border-[#7137A8]/30 bg-gradient-to-br from-[#321044] via-[#240A32] to-[#170520] p-8 sm:p-10 text-white shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#7137A8]/40 text-[#FF9B32] flex items-center justify-center border border-[#FF9B32]/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">How Reporting &amp; Moderation Works</h2>
            <p className="text-xs text-[#AC87DA]">Rapid investigation and bidirectional blocking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-2">
            <span className="font-bold text-[#FF9B32]">1. Instant Blocking</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When you block a member, they are immediately and bidirectionally hidden from all your activities, chats, and discovery feeds.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-2">
            <span className="font-bold text-[#FF9B32]">2. Classified Reports</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Reports are categorized (Harassment, Dating Solicitation, No-Show, Safety Violation) and logged into an immutable audit trail.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-2">
            <span className="font-bold text-[#FF9B32]">3. Moderation Action</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Violators face temporary warnings or permanent account suspension, protecting the community from repeat offenses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
