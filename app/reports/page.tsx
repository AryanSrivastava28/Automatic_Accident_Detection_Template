'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { TopBar } from '@/components/topbar';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  emergenciesByDay,
  emergencyTypeDistribution,
  severityDistribution,
} from '@/lib/mock-data';
import { AlertTriangle, CheckCircle2, Timer, Activity } from 'lucide-react';

const ranges = ['Last 7 days', 'Last 30 days', 'This quarter'];

export default function ReportsPage() {
  const { incidents } = useAppState();
  const [range, setRange] = useState(ranges[0]);

  const stats = useMemo(() => {
    const total = incidents.length;
    const resolved = incidents.filter((i) => i.status === 'Resolved').length;
    const critical = incidents.filter((i) => i.severity === 'Critical').length;
    return { total, resolved, critical, avg: '8.4 min' };
  }, [incidents]);

  return (
    <div className="flex flex-col">
      <TopBar title="Reports & Analytics" subtitle="Emergency response insights and trends" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Range filter */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing data for the selected period</p>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ranges.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Emergencies" value={stats.total} icon={AlertTriangle} accent="red" />
          <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} accent="emerald" />
          <StatCard label="Critical Incidents" value={stats.critical} icon={Activity} accent="orange" />
          <StatCard label="Avg Response Time" value={stats.avg} icon={Timer} accent="violet" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Emergencies by day */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Emergencies by Day</h3>
              <p className="text-xs text-muted-foreground">Reported vs resolved over the last week</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={emergenciesByDay} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="emergencies" name="Reported" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Emergency type distribution */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Emergency Type Distribution</h3>
              <p className="text-xs text-muted-foreground">Breakdown by incident category</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={emergencyTypeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {emergencyTypeDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Severity distribution */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Severity Distribution</h3>
              <p className="text-xs text-muted-foreground">Incidents grouped by severity level</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={severityDistribution} layout="vertical" barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={70} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" name="Incidents" radius={[0, 4, 4, 0]}>
                  {severityDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Summary card */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Operational Summary</h3>
              <p className="text-xs text-muted-foreground">Key metrics for {range.toLowerCase()}</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Resolution rate', value: `${Math.round((stats.resolved / Math.max(stats.total, 1)) * 100)}%`, color: 'text-emerald-500' },
                { label: 'Avg dispatch time', value: '4.2 min', color: 'text-blue-500' },
                { label: 'Teams utilized', value: '6 / 8', color: 'text-violet-500' },
                { label: 'Hospital capacity used', value: '62%', color: 'text-amber-500' },
                { label: 'Critical response rate', value: '94%', color: 'text-red-500' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className={`text-lg font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
