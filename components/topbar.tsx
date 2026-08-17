'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/format';
import { Bell, Siren, Check, Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

const typeIconColor: Record<string, string> = {
  critical: 'bg-red-500',
  dispatch: 'bg-cyan-500',
  update: 'bg-blue-500',
  resolve: 'bg-emerald-500',
  info: 'bg-slate-500',
};

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { notifications, markAllNotificationsRead, markNotificationRead, simulateEmergency } =
    useAppState();
  const [simulating, setSimulating] = useState(false);
  const { theme, setTheme } = useTheme();
  const unread = notifications.filter((n) => !n.read).length;

  const handleSimulate = () => {
    setSimulating(true);
    simulateEmergency();
    setTimeout(() => setSimulating(false), 700);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur md:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold tracking-tight md:text-xl">{title}</h1>
        {subtitle && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSimulate}
          disabled={simulating}
          className="hidden gap-2 sm:flex"
        >
          <Zap className={cn('h-4 w-4', simulating && 'animate-pulse text-amber-500')} />
          {simulating ? 'Simulating...' : 'Simulate Emergency'}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 sm:hidden"
          onClick={handleSimulate}
          disabled={simulating}
        >
          <Zap className={cn('h-4 w-4', simulating && 'animate-pulse text-amber-500')} />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 md:w-96" align="end">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-semibold">Notifications</span>
                {unread > 0 && <Badge variant="secondary" className="text-xs">{unread} new</Badge>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllNotificationsRead}
                disabled={unread === 0}
              >
                <Check className="mr-1 h-3 w-3" /> Mark all read
              </Button>
            </div>
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent',
                        !n.read && 'bg-primary/5',
                      )}
                    >
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', typeIconColor[n.type])} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{n.title}</p>
                          {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(n.timestamp)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
