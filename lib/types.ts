export type EmergencyType =
  | 'Vehicle Accident'
  | 'Fire'
  | 'Medical Emergency'
  | 'Road Accident'
  | 'Other';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus =
  | 'Detected'
  | 'Pending Response'
  | 'Team Dispatched'
  | 'On the Way'
  | 'Under Response'
  | 'Resolved';

export type TeamType = 'Ambulance' | 'Police' | 'Fire & Rescue' | 'Medical Response';

export type TeamStatus = 'Available' | 'Dispatched' | 'Busy' | 'Offline';

export type HospitalStatus = 'Available' | 'Limited Capacity' | 'Full';

export type NotificationType = 'critical' | 'dispatch' | 'update' | 'resolve' | 'info';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface TimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  done: boolean;
}

export interface Incident {
  id: string;
  type: EmergencyType;
  severity: Severity;
  description: string;
  location: string;
  coordinates: GeoPoint;
  reportedTime: string;
  affectedPeople: number;
  reporterName: string;
  reporterContact: string;
  status: IncidentStatus;
  assignedTeamId: string | null;
  hospitalId: string | null;
  timeline: TimelineEvent[];
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface ResponseTeam {
  id: string;
  type: TeamType;
  members: number;
  vehicle: string;
  location: string;
  coordinates: GeoPoint;
  status: TeamStatus;
  currentIncidentId: string | null;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  coordinates: GeoPoint;
  emergencyDept: boolean;
  availableBeds: number;
  icuBeds: number;
  ambulanceAvailable: number;
  distanceFromIncident: number;
  status: HospitalStatus;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}
