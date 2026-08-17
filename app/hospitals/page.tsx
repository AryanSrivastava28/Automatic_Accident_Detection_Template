'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { TopBar } from '@/components/topbar';
import { HospitalStatusBadge } from '@/components/status-badges';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { hospitalStatuses } from '@/lib/mock-data';
import {
  Building2,
  MapPin,
  Bed,
  HeartPulse,
  Ambulance,
  Search,
  Navigation,
  CircleDot,
} from 'lucide-react';

export default function HospitalsPage() {
  const { hospitals } = useAppState();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [hospitals, search, statusFilter]);

  return (
    <div className="flex flex-col">
      <TopBar title="Hospitals" subtitle={`${hospitals.length} hospitals in network`} />

      <div className="space-y-4 p-4 md:p-6">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search hospitals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {hospitalStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Hospital cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <Card key={h.id} className="p-5 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{h.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {h.location}
                    </p>
                  </div>
                </div>
                <HospitalStatusBadge status={h.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat icon={Bed} label="Beds" value={h.availableBeds} />
                <Stat icon={HeartPulse} label="ICU" value={h.icuBeds} />
                <Stat icon={Ambulance} label="Amb." value={h.ambulanceAvailable} />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                <div className="flex items-center gap-2">
                  {h.emergencyDept ? (
                    <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      <CircleDot className="h-3 w-3" /> Emergency Dept
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">No ER</Badge>
                  )}
                </div>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5" /> {h.distanceFromIncident} km
                </span>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No hospitals found</p>
            <p className="text-xs text-muted-foreground">Try adjusting the filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-1 text-lg font-bold leading-none">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
