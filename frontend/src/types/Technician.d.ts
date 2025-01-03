import { Appointment } from './Appointment';
import { Availability } from './Availability';

export type Technician = {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  color: string;
  requested_hours: number;
  skill_level: number;
  spanish_speaking: boolean;
  notes: string;
  is_maxed_on_sessions: boolean;
  total_hours: number;
  total_hours_by_day: number[];

  // Sometimes available
  appointments?: Appointment[];
  availabilities?: Availability[];
};
