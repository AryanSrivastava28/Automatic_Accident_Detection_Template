'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { TopBar } from '@/components/topbar';
import { SeverityBadge, StatusBadge } from '@/components/status-badges';
import { IncidentDetailDialog } from '@/components/incident-detail-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { emergencyTypes, severities, incidentStatuses } from '@/lib/mock-data';
import { formatDateTime, timeAgo } from '@/lib/format';
import type { Incident } from '@/lib/types';
import { Search, Filter, ArrowRight, Users, MapPin, X } from 'lucide-react';

export default function IncidentsPage() {
  const { incidents, responseTeams } = useAppState();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Incident | null>(null);

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        !search ||
        inc.id.toLowerCase().includes(search.toLowerCase()) ||
        inc.location.toLowerCase().includes(search.toLowerCase()) ||
        inc.type.toLowerCase().includes(search.toLowerCase()) ||
        inc.description.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
      const matchesType = typeFilter === 'all' || inc.type === typeFilter;
      return matchesSearch && matchesSeverity && matchesStatus && matchesType;
    });
  }, [incidents, search, severityFilter, statusFilter, typeFilter]);

  const hasFilters = severityFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || search !== '';

  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="flex flex-col">
      <TopBar title="Incidents" subtitle={`${filtered.length} of ${incidents.length} incidents`} />

      <div className="space-y-4 p-4 md:p-6">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, location, type, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {emergencyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  {severities.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {incidentStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                <X className="mr-1 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Incident ID</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Reported</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <Filter className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      No incidents match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inc) => {
                    const team = responseTeams.find((t) => t.id === inc.assignedTeamId);
                    return (
                      <tr
                        key={inc.id}
                        className="cursor-pointer transition-colors hover:bg-muted/30"
                        onClick={() => setSelected(inc)}
                      >
                        <td className="px-4 py-3 font-semibold">{inc.id}</td>
                        <td className="px-4 py-3">{inc.type}</td>
                        <td className="px-4 py-3"><SeverityBadge severity={inc.severity} withDot /></td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">{inc.location}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{timeAgo(inc.reportedTime)}</td>
                        <td className="px-4 py-3"><StatusBadge status={inc.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{team ? team.id : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary">
                            View <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border md:hidden">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground">
                <Filter className="mx-auto mb-2 h-8 w-8 opacity-50" />
                No incidents match the current filters.
              </div>
            ) : (
              filtered.map((inc) => {
                const team = responseTeams.find((t) => t.id === inc.assignedTeamId);
                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelected(inc)}
                    className="flex w-full flex-col gap-2 p-4 text-left transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{inc.id}</span>
                      <StatusBadge status={inc.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{inc.type}</span>
                      <SeverityBadge severity={inc.severity} withDot />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {inc.location}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{timeAgo(inc.reportedTime)}</span>
                      <span>Team: {team ? team.id : '—'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <IncidentDetailDialog incident={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
