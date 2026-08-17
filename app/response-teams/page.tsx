'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { TopBar } from '@/components/topbar';
import { TeamStatusBadge } from '@/components/status-badges';
import { IncidentDetailDialog } from '@/components/incident-detail-dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teamTypes, teamStatuses } from '@/lib/mock-data';
import type { Incident, TeamType } from '@/lib/types';
import {
  Ambulance,
  Shield,
  Flame,
  Stethoscope,
  Users,
  Truck,
  MapPin,
  Search,
  UserCheck,
  Siren,
} from 'lucide-react';

const teamIcon: Record<TeamType, typeof Ambulance> = {
  Ambulance: Ambulance,
  Police: Shield,
  'Fire & Rescue': Flame,
  'Medical Response': Stethoscope,
};

const teamAccent: Record<TeamType, string> = {
  Ambulance: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  Police: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Fire & Rescue': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'Medical Response': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

export default function ResponseTeamsPage() {
  const { responseTeams, incidents, assignTeam } = useAppState();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const pendingIncidents = useMemo(
    () => incidents.filter((i) => i.status !== 'Resolved' && !i.assignedTeamId),
    [incidents],
  );

  const filtered = useMemo(() => {
    return responseTeams.filter((t) => {
      const matchesSearch =
        !search ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.type.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [responseTeams, search, typeFilter, statusFilter]);

  const handleAssign = (teamId: string, incidentId: string) => {
    assignTeam(incidentId, teamId);
    setAssignTarget(null);
    const inc = incidents.find((i) => i.id === incidentId);
    if (inc) setSelectedIncident(inc);
  };

  return (
    <div className="flex flex-col">
      <TopBar title="Response Teams" subtitle={`${responseTeams.length} teams registered`} />

      <div className="space-y-4 p-4 md:p-6">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {teamTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {teamStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Team cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team) => {
            const Icon = teamIcon[team.type];
            const accent = teamAccent[team.type];
            const currentIncident = incidents.find((i) => i.id === team.currentIncidentId);
            return (
              <Card key={team.id} className="p-5 transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{team.id}</p>
                      <p className="text-xs text-muted-foreground">{team.type}</p>
                    </div>
                  </div>
                  <TeamStatusBadge status={team.status} />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{team.members} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-4 w-4 shrink-0" />
                    <span className="truncate">{team.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{team.location}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  {currentIncident ? (
                    <button
                      onClick={() => setSelectedIncident(currentIncident)}
                      className="flex w-full items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
                    >
                      <Siren className="h-3.5 w-3.5 shrink-0 text-red-500" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">On incident {currentIncident.id}</p>
                        <p className="truncate text-muted-foreground">{currentIncident.location}</p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">No active assignment</span>
                      {pendingIncidents.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => setAssignTarget(team.id)}
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Assign
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No teams found</p>
            <p className="text-xs text-muted-foreground">Try adjusting the filters.</p>
          </Card>
        )}
      </div>

      {/* Assign dialog */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAssignTarget(null)}>
          <Card className="w-full max-w-md p-5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Assign Team {assignTarget}</h3>
              <p className="text-sm text-muted-foreground">Select an unassigned incident to dispatch this team to.</p>
            </div>
            {pendingIncidents.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No pending incidents to assign.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto scrollbar-thin">
                {pendingIncidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => handleAssign(assignTarget, inc.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <Siren className="h-4 w-4 shrink-0 text-red-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{inc.id} · {inc.type}</p>
                      <p className="truncate text-xs text-muted-foreground">{inc.location}</p>
                    </div>
                    <UserCheck className="h-4 w-4 shrink-0 text-primary" />
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" className="mt-4 w-full" onClick={() => setAssignTarget(null)}>
              Cancel
            </Button>
          </Card>
        </div>
      )}

      <IncidentDetailDialog incident={selectedIncident} open={!!selectedIncident} onOpenChange={(o) => !o && setSelectedIncident(null)} />
    </div>
  );
}
