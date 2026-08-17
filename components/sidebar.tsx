'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Siren,
  AlertTriangle,
  Map,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ShieldAlert,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Emergency Alerts', href: '/emergency-alert', icon: Siren },
  { label: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { label: 'Live Map', href: '/live-map', icon: Map },
  { label: 'Response Teams', href: '/response-teams', icon: Users },
  { label: 'Hospitals', href: '/hospitals', icon: Building2 },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colours',
                active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
            <span>{item.label}</span>
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function UserProfile() {
  const { user, logout } = useAppState();
  const router = useRouter();
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
      <Avatar className="h-9 w-9 border border-border">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.role}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => {
          logout();
          router.replace('/login');
        }}
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                  <Siren className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold tracking-tight">Sentinel</span>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <NavList onNavigate={() => setMobileOpen(false)} />
              </div>
              <div className="border-t border-border p-3">
                <UserProfile />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
            <Siren className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-tight">Sentinel</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/20">
            <Siren className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold leading-none tracking-tight">Sentinel</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Emergency Response</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <NavList />
        </div>
        <div className="border-t border-border p-3">
          <UserProfile />
        </div>
      </aside>
    </>
  );
}

export function MobileTopBar() {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <span className="font-semibold">Sentinel</span>
      </div>
    </div>
  );
}
