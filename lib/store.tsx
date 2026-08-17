'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Incident,
  ResponseTeam,
  Hospital,
  Notification,
  User,
  IncidentStatus,
  EmergencyType,
  Severity,
  TimelineEvent,
} from './types';
import {
  mockIncidents,
  mockResponseTeams,
  mockHospitals,
  mockNotifications,
  currentUser,
  emergencyTypes,
  severities,
} from './mock-data';

interface AppState {
  user: User | null;
  login: (email: string) => void;
  loginAsDemo: () => void;
  logout: () => void;

  incidents: Incident[];
  responseTeams: ResponseTeam[];
  hospitals: Hospital[];
  notifications: Notification[];

  addIncident: (incident: Incident) => void;
  assignTeam: (incidentId: string, teamId: string) => void;
  dispatchTeam: (incidentId: string) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  markResolved: (incidentId: string) => void;
  assignHospital: (incidentId: string, hospitalId: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;

  simulateEmergency: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

let idCounter = 100;
const nextId = (prefix: string) => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const sampleLocations = [
  { name: 'Cyber City Road, Tower 3', lat: 28.4945, lng: 77.0888 },
  { name: 'Sector 14 Market Square', lat: 28.4733, lng: 77.0511 },
  { name: 'Riverside Drive, Block A', lat: 28.4689, lng: 77.0712 },
  { name: 'Old Town Crossing, Lane 5', lat: 28.4821, lng: 77.0666 },
  { name: 'Airport Expressway, KM 4', lat: 28.5012, lng: 77.1023 },
  { name: 'University Campus, Gate 2', lat: 28.4712, lng: 77.0589 },
];

const sampleDescriptions: Record<EmergencyType, string[]> = {
  'Vehicle Accident': [
    'Two-car collision at a busy intersection. One vehicle on its side.',
    'Rear-end collision during heavy traffic. Minor injuries reported.',
  ],
  Fire: [
    'Structural fire in a residential building. Smoke billowing from second floor.',
    'Electrical fire in a commercial kitchen. Power disconnected.',
  ],
  'Medical Emergency': [
    'Pedestrian collapsed on the sidewalk. Unresponsive but breathing.',
    'Worker reported dizziness and chest tightness at a construction site.',
  ],
  'Road Accident': [
    'Two-wheeler collided with a divider. Rider has a visible leg injury.',
    'Cyclist hit by a reversing truck at a parking lot exit.',
  ],
  Other: [
    'Fallen power line across a residential lane. Sparks reported.',
    'Water pipe burst flooding a basement. No injuries.',
  ],
};

const buildTimeline = (start: string): TimelineEvent[] => [
  { id: 't1', label: 'Emergency detected', timestamp: start, done: true },
  { id: 't2', label: 'Alert received', timestamp: start, done: true },
  { id: 't3', label: 'Response team assigned', timestamp: '', done: false },
  { id: 't4', label: 'Team dispatched', timestamp: '', done: false },
  { id: 't5', label: 'Team reached location', timestamp: '', done: false },
  { id: 't6', label: 'Patient transferred', timestamp: '', done: false },
  { id: 't7', label: 'Incident resolved', timestamp: '', done: false },
];

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [responseTeams, setResponseTeams] = useState<ResponseTeam[]>(mockResponseTeams);
  const [hospitals] = useState<Hospital[]>(mockHospitals);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const login = useCallback((email: string) => {
    setUser({ ...currentUser, email });
  }, []);

  const loginAsDemo = useCallback(() => {
    setUser(currentUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const pushNotification = useCallback(
    (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      setNotifications((prev) => [
        {
          ...n,
          id: nextId('N'),
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    },
    [],
  );

  const addIncident = useCallback(
    (incident: Incident) => {
      setIncidents((prev) => [incident, ...prev]);
      pushNotification({
        type: 'critical',
        title: 'New emergency reported',
        message: `Incident #${incident.id} reported at ${incident.location}.`,
      });
    },
    [pushNotification],
  );

  const setTeamStatus = useCallback(
    (teamId: string, status: ResponseTeam['status'], incidentId: string | null) => {
      setResponseTeams((prev) =>
        prev.map((t) =>
          t.id === teamId ? { ...t, status, currentIncidentId: incidentId } : t,
        ),
      );
    },
    [],
  );

  const advanceTimeline = (incident: Incident, upToLabel: string): TimelineEvent[] => {
    let reached = false;
    return incident.timeline.map((ev) => {
      if (ev === incident.timeline.find((e) => e.label === upToLabel)) reached = true;
      if (reached && !ev.done) {
        return { ...ev, done: true, timestamp: new Date().toISOString() };
      }
      return ev;
    });
  };

  const assignTeam = useCallback(
    (incidentId: string, teamId: string) => {
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id !== incidentId) return inc;
          const updated = { ...inc, assignedTeamId: teamId, status: 'Pending Response' as IncidentStatus };
          updated.timeline = inc.timeline.map((ev) =>
            ev.label === 'Response team assigned' && !ev.done
              ? { ...ev, done: true, timestamp: new Date().toISOString() }
              : ev,
          );
          return updated;
        }),
      );
      setTeamStatus(teamId, 'Busy', incidentId);
      pushNotification({
        type: 'dispatch',
        title: 'Response team assigned',
        message: `Team ${teamId} assigned to Incident #${incidentId}.`,
      });
    },
    [pushNotification, setTeamStatus],
  );

  const dispatchTeam = useCallback(
    (incidentId: string) => {
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id !== incidentId) return inc;
          const updated = { ...inc, status: 'Team Dispatched' as IncidentStatus };
          updated.timeline = inc.timeline.map((ev) =>
            ev.label === 'Team dispatched' && !ev.done
              ? { ...ev, done: true, timestamp: new Date().toISOString() }
              : ev,
          );
          return updated;
        }),
      );
      const incident = incidents.find((i) => i.id === incidentId);
      if (incident?.assignedTeamId) {
        setTeamStatus(incident.assignedTeamId, 'Dispatched', incidentId);
      }
      pushNotification({
        type: 'dispatch',
        title: 'Team dispatched',
        message: `Team dispatched to Incident #${incidentId}.`,
      });
    },
    [incidents, pushNotification, setTeamStatus],
  );

  const updateIncidentStatus = useCallback(
    (incidentId: string, status: IncidentStatus) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incidentId ? { ...inc, status } : inc)),
      );
      pushNotification({
        type: 'update',
        title: 'Incident status updated',
        message: `Incident #${incidentId} is now "${status}".`,
      });
    },
    [pushNotification],
  );

  const markResolved = useCallback(
    (incidentId: string) => {
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id !== incidentId) return inc;
          const updated = { ...inc, status: 'Resolved' as IncidentStatus };
          updated.timeline = inc.timeline.map((ev) =>
            !ev.done ? { ...ev, done: true, timestamp: new Date().toISOString() } : ev,
          );
          return updated;
        }),
      );
      const incident = incidents.find((i) => i.id === incidentId);
      if (incident?.assignedTeamId) {
        setTeamStatus(incident.assignedTeamId, 'Available', null);
      }
      pushNotification({
        type: 'resolve',
        title: 'Incident resolved',
        message: `Incident #${incidentId} marked as resolved.`,
      });
    },
    [incidents, pushNotification, setTeamStatus],
  );

  const assignHospital = useCallback(
    (incidentId: string, hospitalId: string) => {
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === incidentId ? { ...inc, hospitalId } : inc,
        ),
      );
      pushNotification({
        type: 'update',
        title: 'Hospital assigned',
        message: `Hospital assigned to Incident #${incidentId}.`,
      });
    },
    [pushNotification],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const simulateEmergency = useCallback(() => {
    const type = randomFrom(emergencyTypes);
    const severity = randomFrom(severities);
    const loc = randomFrom(sampleLocations);
    const id = nextId('ER');
    const reportedTime = new Date().toISOString();
    const incident: Incident = {
      id,
      type,
      severity,
      description: randomFrom(sampleDescriptions[type]),
      location: loc.name,
      coordinates: { lat: loc.lat, lng: loc.lng },
      reportedTime,
      affectedPeople: Math.floor(Math.random() * 6),
      reporterName: 'Automated Detection System',
      reporterContact: 'N/A',
      status: 'Detected',
      assignedTeamId: null,
      hospitalId: null,
      timeline: buildTimeline(reportedTime),
      imageUrl: null,
      videoUrl: null,
    };
    setIncidents((prev) => [incident, ...prev]);
    pushNotification({
      type: 'critical',
      title: `${severity} ${type.toLowerCase()} detected`,
      message: `Incident #${id} detected at ${incident.location}.`,
    });
  }, [pushNotification]);

  const value = useMemo<AppState>(
    () => ({
      user,
      login,
      loginAsDemo,
      logout,
      incidents,
      responseTeams,
      hospitals,
      notifications,
      addIncident,
      assignTeam,
      dispatchTeam,
      updateIncidentStatus,
      markResolved,
      assignHospital,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      simulateEmergency,
    }),
    [
      user,
      login,
      loginAsDemo,
      logout,
      incidents,
      responseTeams,
      hospitals,
      notifications,
      addIncident,
      assignTeam,
      dispatchTeam,
      updateIncidentStatus,
      markResolved,
      assignHospital,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      simulateEmergency,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
