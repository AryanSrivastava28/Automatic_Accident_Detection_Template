'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/store';
import { TopBar } from '@/components/topbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { Bell, Shield, MapPin, Globe, Moon, Sun, Save, User } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAppState();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [notifications, setNotifications] = useState({
    critical: true,
    dispatch: true,
    updates: false,
    capacity: true,
  });
  const [saved, setSaved] = useState(false);

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col">
      <TopBar title="Settings" subtitle="Manage your account and system preferences" />

      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Appearance</CardTitle>
            <CardDescription>Customize how the dashboard looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
            <CardDescription>Choose which alerts you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <NotifRow
              label="Critical emergencies"
              description="Get alerted when a critical incident is detected"
              checked={notifications.critical}
              onChange={(v) => setNotifications((n) => ({ ...n, critical: v }))}
            />
            <NotifRow
              label="Team dispatches"
              description="Notifications when teams are dispatched or arrive"
              checked={notifications.dispatch}
              onChange={(v) => setNotifications((n) => ({ ...n, dispatch: v }))}
            />
            <NotifRow
              label="Status updates"
              description="General incident status changes"
              checked={notifications.updates}
              onChange={(v) => setNotifications((n) => ({ ...n, updates: v }))}
            />
            <NotifRow
              label="Hospital capacity"
              description="Alerts when hospital capacity changes"
              checked={notifications.capacity}
              onChange={(v) => setNotifications((n) => ({ ...n, capacity: v }))}
            />
          </CardContent>
        </Card>

        {/* System (read-only placeholders for future readiness) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> System Integration</CardTitle>
            <CardDescription>Backend integrations ready for future expansion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: MapPin, label: 'GPS / Live Maps', status: 'Ready to integrate', enabled: false },
              { icon: Bell, label: 'SMS / Email Notifications', status: 'Ready to integrate', enabled: false },
              { icon: Shield, label: 'Real Authentication', status: 'Mock mode', enabled: false },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <row.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.status}</p>
                  </div>
                </div>
                <Switch checked={row.enabled} disabled />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-emerald-500">Settings saved</span>}
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotifRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
