'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { TopBar } from '@/components/topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge, StatusBadge } from '@/components/status-badges';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/format';
import type { Incident, GeoPoint } from '@/lib/types';
import {
  Siren,
  Building2,
  Shield,
  Flame,
  Ambulance,
  MapPin,
  X,
  Layers,
  Navigation,
} from 'lucide-react';

type MarkerType = 'incident' | 'hospital' | 'police' | 'fire' | 'team';

interface Marker {
  id: string;
  type: MarkerType;
  coords: GeoPoint;
  label: string;
  sub?: string;
  incident?: Incident;
}

const markerConfig: Record<MarkerType, { color: string; icon: typeof Siren; ring?: string }> = {
  incident: { color: 'bg-red-500 text-white', icon: Siren, ring: 'ring-red-500/40' },
  hospital: { color: 'bg-emerald-500 text-white', icon: Building2 },
  police: { color: 'bg-blue-500 text-white', icon: Shield },
  fire: { color: 'bg-orange-500 text-white', icon: Flame },
  team: { color: 'bg-cyan-500 text-white', icon: Ambulance },
};

export default function LiveMapPage() {
  const { incidents, hospitals, responseTeams } = useAppState();
  const [selected, setSelected] = useState<Marker | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Record<MarkerType, boolean>>({
    incident: true,
    hospital: true,
    police: true,
    fire: true,
    team: true,
  });

  const markers = useMemo<Marker[]>(() => {
    const incidentMarkers: Marker[] = incidents
      .filter((i) => i.status !== 'Resolved')
      .map((i) => ({
        id: i.id,
        type: 'incident' as const,
        coords: i.coordinates,
        label: `${i.id} · ${i.type}`,
        sub: i.location,
        incident: i,
      }));
    const hospitalMarkers: Marker[] = hospitals.map((h) => ({
      id: h.id,
      type: 'hospital' as const,
      coords: h.coordinates,
      label: h.name,
      sub: h.location,
    }));
    const teamMarkers: Marker[] = responseTeams
      .filter((t) => t.status !== 'Offline')
      .map((t) => ({
        id: t.id,
        type: 'team' as const,
        coords: t.coordinates,
        label: `${t.id} · ${t.type}`,
        sub: t.location,
      }));
    const policeMarkers: Marker[] = responseTeams
      .filter((t) => t.type === 'Police' && t.status !== 'Offline')
      .map((t) => ({
        id: `police-${t.id}`,
        type: 'police' as const,
        coords: { lat: t.coordinates.lat + 0.002, lng: t.coordinates.lng + 0.002 },
        label: `${t.id} Police`,
        sub: t.location,
      }));
    const fireMarkers: Marker[] = responseTeams
      .filter((t) => t.type === 'Fire & Rescue' && t.status !== 'Offline')
      .map((t) => ({
        id: `fire-${t.id}`,
        type: 'fire' as const,
        coords: { lat: t.coordinates.lat - 0.002, lng: t.coordinates.lng - 0.002 },
        label: `${t.id} Fire`,
        sub: t.location,
      }));
    return [...incidentMarkers, ...hospitalMarkers, ...teamMarkers, ...policeMarkers, ...fireMarkers];
  }, [incidents, hospitals, responseTeams]);

  // Project lat/lng to x/y percentages within a fixed bounding box
  const bounds = { minLat: 28.45, maxLat: 28.51, minLng: 77.04, maxLng: 77.11 };
  const project = (c: GeoPoint) => {
    const x = ((c.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = (1 - (c.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  const toggleLayer = (type: MarkerType) =>
    setVisibleLayers((prev) => ({ ...prev, [type]: !prev[type] }));

  const visibleMarkers = markers.filter((m) => visibleLayers[m.type]);

  const selectedIncident = selected?.incident;
  const selectedTeam = selectedIncident
    ? responseTeams.find((t) => t.id === selectedIncident.assignedTeamId)
    : null;
  const nearestHospital = selectedIncident
    ? [...hospitals].sort((a, b) => a.distanceFromIncident - b.distanceFromIncident)[0]
    : null;

  return (
    <div className="flex flex-col">
      <TopBar title="Live Map" subtitle="Real-time incident and resource mapping" />
      <div className="flex flex-col gap-4 p-4 md:p-6 lg:flex-row">
        {/* Map */}
        <div className="relative flex-1">
          <Card className="relative h-[60vh] min-h-[420px] overflow-hidden lg:h-[72vh]">
            {/* Map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
              <div className="absolute inset-0 map-grid opacity-60" />
              {/* Fake roads */}
              <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
                <path d="M 0 35% L 100% 30%" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-400 dark:text-slate-600" />
                <path d="M 0 65% L 100% 70%" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-400 dark:text-slate-600" />
                <path d="M 25% 0 L 30% 100%" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-400 dark:text-slate-600" />
                <path d="M 70% 0 L 65% 100%" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-400 dark:text-slate-600" />
                <path d="M 10% 10% Q 50% 50% 90% 90%" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="6 6" className="text-slate-400 dark:text-slate-600" />
              </svg>
              {/* Fake water body */}
              <div className="absolute bottom-[10%] right-[5%] h-24 w-40 rounded-full bg-blue-200/40 dark:bg-blue-900/30 blur-sm" />
            </div>

            {/* Markers */}
            {visibleMarkers.map((m) => {
              const { x, y } = project(m.coords);
              const cfg = markerConfig[m.type];
              const Icon = cfg.icon;
              const isSelected = selected?.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={cn(
                    'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-110',
                    cfg.color,
                    m.type === 'incident' ? 'h-7 w-7 ring-2 ring-offset-2 ring-offset-background' : 'h-6 w-6',
                    cfg.ring,
                    isSelected && 'scale-125 ring-4',
                    m.type === 'incident' && 'animate-pulse-slow',
                  )}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={m.label}
                >
                  <Icon className={cn(m.type === 'incident' ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
                </button>
              );
            })}

            {/* Layer controls */}
            <div className="absolute left-3 top-3 z-20">
              <Card className="p-2">
                <div className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" /> Layers
                </div>
                <div className="space-y-0.5">
                  {(Object.keys(markerConfig) as MarkerType[]).map((type) => {
                    const cfg = markerConfig[type];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => toggleLayer(type)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors',
                          visibleLayers[type] ? 'text-foreground' : 'text-muted-foreground/50',
                        )}
                      >
                        <span className={cn('flex h-4 w-4 items-center justify-center rounded-full', cfg.color, !visibleLayers[type] && 'opacity-40')}>
                          <Icon className="h-2.5 w-2.5" />
                        </span>
                        <span className="capitalize">{type === 'team' ? 'Ambulance' : type}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-20">
              <Card className="flex items-center gap-3 px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Incident</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Hospital</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> Team</span>
              </Card>
            </div>
          </Card>
        </div>

        {/* Side panel */}
        <div className="w-full shrink-0 lg:w-80">
          <Card className="p-5">
            {!selected ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Select a marker</p>
                  <p className="text-xs text-muted-foreground">Click any marker on the map to view details.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', markerConfig[selected.type].color)}>
                      {(() => {
                        const Icon = markerConfig[selected.type].icon;
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{selected.label}</p>
                      {selected.sub && <p className="text-xs text-muted-foreground">{selected.sub}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSelected(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {selectedIncident ? (
                  <>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={selectedIncident.severity} withDot />
                      <StatusBadge status={selectedIncident.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>

                    <div className="space-y-2 border-t border-border pt-3 text-sm">
                      <Row label="Location" value={selectedIncident.location} />
                      <Row label="Reported" value={timeAgo(selectedIncident.reportedTime)} />
                      <Row label="People affected" value={String(selectedIncident.affectedPeople)} />
                      <Row
                        label="Assigned team"
                        value={selectedTeam ? `${selectedTeam.id} · ${selectedTeam.type}` : 'Unassigned'}
                      />
                    </div>

                    {nearestHospital && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Navigation className="h-3.5 w-3.5" /> Nearest hospital
                        </div>
                        <p className="text-sm font-medium">{nearestHospital.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {nearestHospital.distanceFromIncident} km away · {nearestHospital.availableBeds} beds available
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2 border-t border-border pt-3 text-sm">
                    <Row label="Type" value={selected.type === 'team' ? 'Response Team' : selected.type} />
                    <Row label="Coordinates" value={`${selected.coords.lat.toFixed(4)}, ${selected.coords.lng.toFixed(4)}`} />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Active incidents</p>
              <p className="mt-1 text-2xl font-bold text-red-500">
                {incidents.filter((i) => i.status !== 'Resolved').length}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Available teams</p>
              <p className="mt-1 text-2xl font-bold text-emerald-500">
                {responseTeams.filter((t) => t.status === 'Available').length}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}
