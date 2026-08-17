'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SeverityBadge, StatusBadge } from '@/components/status-badges';
import { formatDateTime, timeAgo } from '@/lib/format';
import type { Incident, IncidentStatus } from '@/lib/types';
import {
  MapPin,
  Clock,
  Users,
  Phone,
  User,
  Ambulance,
  Building2,
  FileText,
  CheckCircle2,
  Circle,
  UserCheck,
  Send,
  RefreshCw,
  CheckCheck,
  Hospital as HospitalIcon,
} from 'lucide-react';

const statusOptions: IncidentStatus[] = [
  'Detected',
  'Pending Response',
  'Team Dispatched',
  'On the Way',
  'Under Response',
  'Resolved',
];

interface Props {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncidentDetailDialog({ incident, open, onOpenChange }: Props) {
  const {
    responseTeams,
    hospitals,
    assignTeam,
    dispatchTeam,
    updateIncidentStatus,
    markResolved,
    assignHospital,
  } = useAppState();

  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<string>('');

  if (!incident) return null;

  const assignedTeam = responseTeams.find((t) => t.id === incident.assignedTeamId);
  const assignedHospital = hospitals.find((h) => h.id === incident.hospitalId);
  const availableTeams = responseTeams.filter(
    (t) => t.status === 'Available' || t.id === incident.assignedTeamId,
  );
  const availableHospitals = hospitals.filter((h) => h.status !== 'Full');

  const handleAssign = () => {
    if (selectedTeam) {
      assignTeam(incident.id, selectedTeam);
      setSelectedTeam('');
    }
  };

  const handleDispatch = () => {
    dispatchTeam(incident.id);
  };

  const handleStatusChange = (status: string) => {
    updateIncidentStatus(incident.id, status as IncidentStatus);
  };

  const handleResolve = () => {
    markResolved(incident.id);
  };

  const handleAssignHospital = () => {
    if (selectedHospital) {
      assignHospital(incident.id, selectedHospital);
      setSelectedHospital('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-lg">Incident {incident.id}</DialogTitle>
              <DialogDescription className="mt-0.5">
                Reported {timeAgo(incident.reportedTime)} · {incident.type}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={incident.severity} withDot />
              <StatusBadge status={incident.status} />
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 px-6 py-5">
            {/* Description */}
            <div>
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" /> Description
              </div>
              <p className="text-sm leading-relaxed">{incident.description}</p>
            </div>

            {/* Key facts grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={MapPin} label="Location" value={incident.location} />
              <InfoRow icon={Clock} label="Reported" value={formatDateTime(incident.reportedTime)} />
              <InfoRow icon={Users} label="People affected" value={String(incident.affectedPeople)} />
              <InfoRow icon={User} label="Reporter" value={incident.reporterName} />
              <InfoRow icon={Phone} label="Contact" value={incident.reporterContact} />
              <InfoRow
                icon={Ambulance}
                label="Assigned team"
                value={assignedTeam ? `${assignedTeam.id} · ${assignedTeam.type}` : 'Unassigned'}
              />
              <InfoRow
                icon={HospitalIcon}
                label="Hospital"
                value={assignedHospital ? assignedHospital.name : 'Not assigned'}
              />
            </div>

            <Separator />

            {/* Timeline */}
            <div>
              <div className="mb-3 text-sm font-semibold">Response Timeline</div>
              <ol className="relative space-y-3 border-l border-border pl-5">
                {incident.timeline.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span
                      className={cn(
                        'absolute -left-[26px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background',
                        ev.done ? 'bg-primary' : 'bg-muted',
                      )}
                    >
                      {ev.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      )}
                    </span>
                    <p className={cn('text-sm', ev.done ? 'font-medium' : 'text-muted-foreground')}>
                      {ev.label}
                    </p>
                    {ev.timestamp && (
                      <p className="text-xs text-muted-foreground">{formatDateTime(ev.timestamp)}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* Action controls */}
            <div className="space-y-3">
              <div className="text-sm font-semibold">Response Actions</div>

              {/* Assign team */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[180px]">
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select response team" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.id} · {t.type} ({t.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={handleAssign} disabled={!selectedTeam}>
                  <UserCheck className="mr-1.5 h-4 w-4" /> Assign Team
                </Button>
              </div>

              {/* Assign hospital */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[180px]">
                  <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHospitals.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name} ({h.availableBeds} beds)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="outline" onClick={handleAssignHospital} disabled={!selectedHospital}>
                  <Building2 className="mr-1.5 h-4 w-4" /> Assign Hospital
                </Button>
              </div>

              {/* Status + dispatch + resolve */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[180px]">
                  <Select value={incident.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="outline" onClick={handleStatusChange.bind(null, incident.status)}>
                  <RefreshCw className="mr-1.5 h-4 w-4" /> Update Status
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDispatch}
                  disabled={!incident.assignedTeamId || incident.status === 'Resolved'}
                >
                  <Send className="mr-1.5 h-4 w-4" /> Dispatch
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleResolve}
                  disabled={incident.status === 'Resolved'}
                >
                  <CheckCheck className="mr-1.5 h-4 w-4" /> Mark Resolved
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
