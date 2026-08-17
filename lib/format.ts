import type { Severity, IncidentStatus, TeamStatus, HospitalStatus } from './types';

export function formatTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function timeAgo(iso: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const severityStyles: Record<Severity, string> = {
  Critical: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
  High: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  Medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
};

export const statusStyles: Record<IncidentStatus, string> = {
  Detected: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'Pending Response': 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  'Team Dispatched': 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30',
  'On the Way': 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  'Under Response': 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  Resolved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
};

export const teamStatusStyles: Record<TeamStatus, string> = {
  Available: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  Dispatched: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  Busy: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  Offline: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

export const hospitalStatusStyles: Record<HospitalStatus, string> = {
  Available: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  'Limited Capacity': 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  Full: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
};

export const severityDot: Record<Severity, string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-amber-500',
  Low: 'bg-emerald-500',
};
