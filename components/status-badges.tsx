import { cn } from '@/lib/utils';
import { severityStyles, statusStyles, teamStatusStyles, hospitalStatusStyles, severityDot } from '@/lib/format';
import type { Severity, IncidentStatus, TeamStatus, HospitalStatus } from '@/lib/types';

export function SeverityBadge({ severity, withDot = false }: { severity: Severity; withDot?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        severityStyles[severity],
      )}
    >
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full', severityDot[severity])} />}
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

export function TeamStatusBadge({ status }: { status: TeamStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        teamStatusStyles[status],
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'Available' && 'bg-emerald-500',
          status === 'Dispatched' && 'bg-cyan-500',
          status === 'Busy' && 'bg-amber-500',
          status === 'Offline' && 'bg-slate-400',
        )}
      />
      {status}
    </span>
  );
}

export function HospitalStatusBadge({ status }: { status: HospitalStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        hospitalStatusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
