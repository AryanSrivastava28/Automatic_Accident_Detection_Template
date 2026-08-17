'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { TopBar } from '@/components/topbar';
import { StatCard } from '@/components/stat-card';
import { SeverityBadge, StatusBadge } from '@/components/status-badges';
import { IncidentDetailDialog } from '@/components/incident-detail-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { timeAgo, formatTime } from '@/lib/format';
import type { Incident } from '@/lib/types';
import {
  AlertTriangle,
  Activity,
  Users,
  Building2,
  Timer,
  CheckCircle2,
  ArrowRight,
  Siren,
  MapPin,
} from 'lucide-react';

export default function DashboardPage() {
  const { incidents, responseTeams, hospitals } = useAppState();
  const [selected, setSelected] = useState<Incident | null>(null);

  const stats = useMemo(() => {
    const active = incidents.filter((i) => i.status !== 'Resolved').length;
    const today = incidents.length;
    const teamsAvailable = responseTeams.filter((t) => t.status === 'Available').length;
    const hospitalsAvailable = hospitals.filter((h) => h.status === 'Available').length;
    const resolved = incidents.filter((i) => i.status === 'Resolved').length;
    return {
      active,
      today,
      teamsAvailable,
      hospitalsAvailable,
      resolved,
      avgResponse: '8.4 min',
    };
  }, [incidents, responseTeams, hospitals]);

  const activeEmergencies = useMemo(
    () => incidents.filter((i) => i.status !== 'Resolved'),
    [incidents],
  );

  return (
    <div className="flex flex-col">
      <TopBar title="Dashboard" subtitle="Live overview of emergency operations" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Active Emergencies" value={stats.active} icon={AlertTriangle} accent="red" trend={{ value: 'Requires attention', positive: false }} />
          <StatCard label="Emergencies Today" value={stats.today} icon={Activity} accent="orange" trend={{ value: '+12% vs yesterday' }} />
          <StatCard label="Teams Available" value={stats.teamsAvailable} icon={Users} accent="cyan" />
          <StatCard label="Hospitals Available" value={stats.hospitalsAvailable} icon={Building2} accent="emerald" />
          <StatCard label="Avg Response Time" value={stats.avgResponse} icon={Timer} accent="violet" trend={{ value: '-0.6 min', positive: true }} />
          <StatCard label="Resolved Incidents" value={stats.resolved} icon={CheckCircle2} accent="blue" />
        </div>

        {/* Active emergencies */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Active Emergencies</h2>
              <p className="text-sm text-muted-foreground">
                {activeEmergencies.length} ongoing incident{activeEmergencies.length === 1 ? '' : 's'} requiring response
              </p>
            </div>
          </div>

          {activeEmergencies.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-medium">No active emergencies</p>
              <p className="text-xs text-muted-foreground">All incidents have been resolved.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeEmergencies.map((inc) => {
                const team = responseTeams.find((t) => t.id === inc.assignedTeamId);
                return (
                  <Card
                    key={inc.id}
                    className="group cursor-pointer p-5 transition-all hover:shadow-md hover:border-primary/40"
                    onClick={() => setSelected(inc)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                          <Siren className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{inc.id}</p>
                          <p className="text-xs text-muted-foreground">{inc.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={inc.severity} withDot />
                        <StatusBadge status={inc.status} />
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{inc.description}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {inc.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" /> {timeAgo(inc.reportedTime)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {inc.affectedPeople} affected
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Team: </span>
                        <span className="font-medium">
                          {team ? `${team.id} · ${team.type}` : 'Unassigned'}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        View Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <IncidentDetailDialog incident={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
