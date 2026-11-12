import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '@/shared/api/client';
import { ShieldAlert, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId?: string;
  activityId?: string;
  targetName: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  activityId,
  targetName,
}) => {
  const [reason, setReason] = useState<
    'DATING_ATTEMPT' | 'INAPPROPRIATE_BEHAVIOR' | 'HARASSMENT' | 'PRIVATE_LOCATION_VIOLATION' | 'SPAM' | 'OTHER'
  >('DATING_ATTEMPT');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const reportMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/safety/report', {
        reported_user_id: reportedUserId || undefined,
        activity_id: activityId || undefined,
        reason,
        description: description.trim(),
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <ShieldAlert className="h-5 w-5" />
            <span>Community Safety Report</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Report Submitted</h4>
            <p className="text-xs text-slate-500">
              Thank you for keeping our community safe. Our moderation team is reviewing this incident.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErrorMsg(null);
              if (description.trim().length < 10) {
                setErrorMsg('Please provide at least 10 characters explaining what occurred.');
                return;
              }
              reportMutation.mutate();
            }}
            className="space-y-4"
          >
            <p className="text-xs text-slate-600 leading-relaxed">
              Reporting: <strong className="text-slate-900">{targetName}</strong>. SocialConnect has a strict zero-tolerance policy against dating behavior, harassment, and unsafe private meeting locations.
            </p>

            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Violation Category *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="DATING_ATTEMPT">Dating / Romantic solicitation (Not allowed)</option>
                <option value="INAPPROPRIATE_BEHAVIOR">Inappropriate or abusive behavior</option>
                <option value="HARASSMENT">Harassment or unwanted contact</option>
                <option value="PRIVATE_LOCATION_VIOLATION">Proposing private / residential meeting point</option>
                <option value="SPAM">Commercial spam or fraud</option>
                <option value="OTHER">Other violation of community charter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened so moderators can take appropriate action..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                {reportMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

