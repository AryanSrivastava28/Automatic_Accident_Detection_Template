'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store';
import { TopBar } from '@/components/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { emergencyTypes, severities } from '@/lib/mock-data';
import type { EmergencyType, Severity, Incident } from '@/lib/types';
import {
  Siren,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';

let reportIdCounter = 2000;

export default function EmergencyAlertPage() {
  const router = useRouter();
  const { addIncident } = useAppState();

  const [type, setType] = useState<EmergencyType>('Vehicle Accident');
  const [severity, setSeverity] = useState<Severity>('High');
  const [description, setDescription] = useState('');
  const [affectedPeople, setAffectedPeople] = useState('1');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Incident | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoName(file.name);
  };

  const canSubmit = description.trim() && location.trim() && contact.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      reportIdCounter += 1;
      const id = `ER-${reportIdCounter}`;
      const now = new Date().toISOString();
      const incident: Incident = {
        id,
        type,
        severity,
        description: description.trim(),
        location: location.trim(),
        coordinates: { lat: 28.48 + Math.random() * 0.03, lng: 77.05 + Math.random() * 0.05 },
        reportedTime: now,
        affectedPeople: parseInt(affectedPeople, 10) || 0,
        reporterName: reporterName.trim() || 'Anonymous',
        reporterContact: contact.trim(),
        status: 'Pending Response',
        assignedTeamId: null,
        hospitalId: null,
        timeline: [
          { id: 't1', label: 'Emergency detected', timestamp: now, done: true },
          { id: 't2', label: 'Alert received', timestamp: now, done: true },
          { id: 't3', label: 'Response team assigned', timestamp: '', done: false },
          { id: 't4', label: 'Team dispatched', timestamp: '', done: false },
          { id: 't5', label: 'Team reached location', timestamp: '', done: false },
          { id: 't6', label: 'Patient transferred', timestamp: '', done: false },
          { id: 't7', label: 'Incident resolved', timestamp: '', done: false },
        ],
        imageUrl: imagePreview,
        videoUrl: videoName,
      };
      addIncident(incident);
      setConfirmation(incident);
      setSubmitting(false);
    }, 700);
  };

  const resetForm = () => {
    setType('Vehicle Accident');
    setSeverity('High');
    setDescription('');
    setAffectedPeople('1');
    setLocation('');
    setContact('');
    setReporterName('');
    setImagePreview(null);
    setVideoName(null);
  };

  if (confirmation) {
    return (
      <div className="flex flex-col">
        <TopBar title="Emergency Alert" subtitle="Report a new emergency" />
        <div className="flex items-center justify-center p-4 md:p-6">
          <Card className="max-w-lg p-8 text-center animate-fade-in">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold">Emergency Reported Successfully</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your report has been received and added to the active incident list.
            </p>
            <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4 text-left">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Incident ID</p>
                  <p className="font-bold text-primary">{confirmation.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold">Pending Response</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{confirmation.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Severity</p>
                  <p className="font-medium">{confirmation.severity}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{confirmation.location}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={() => router.push('/incidents')}>
                View Incidents <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { resetForm(); setConfirmation(null); }}>
                Report Another
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <TopBar title="Emergency Alert" subtitle="Report a new emergency incident" />
      <div className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <Siren className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Report an Emergency</CardTitle>
                  <CardDescription>Provide accurate details to enable a fast response.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Type & Severity */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Emergency Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as EmergencyType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {emergencyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {severities.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what is happening at the scene..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* People + Location */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Number of people affected</Label>
                  <Input
                    type="number"
                    min={0}
                    value={affectedPeople}
                    onChange={(e) => setAffectedPeople(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. NH-48 Overpass, Sector 21"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Reporter name (optional)</Label>
                  <Input
                    placeholder="Your name"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact number</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Image (optional)</Label>
                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-lg border border-border">
                      <img src={imagePreview} alt="preview" className="h-32 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-xs">Click to upload an image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Video (optional)</Label>
                  {videoName ? (
                    <div className="flex h-32 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 text-center">
                      <Video className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-xs">{videoName}</span>
                      <button
                        type="button"
                        onClick={() => setVideoName(null)}
                        className="ml-1 shrink-0"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                      <Video className="h-5 w-5" />
                      <span className="text-xs">Click to upload a video</span>
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideo} />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button type="submit" size="lg" className="w-full gap-2" disabled={!canSubmit || submitting}>
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="h-4 w-4" /> REPORT EMERGENCY</>
                  )}
                </Button>
                {!canSubmit && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Please fill in description, location, and contact number to submit.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
