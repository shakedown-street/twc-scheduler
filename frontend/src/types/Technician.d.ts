import { Appointment } from './Appointment';
import { Availability } from './Availability';

export type Technician = {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  bg_color: string;
  text_color: string;
  requested_hours: number;
  max_hours_per_day: number;
  skill_level: number;
  spanish_speaking: boolean;
  notes: string;
  is_manually_maxed_out?: boolean;

  // Sometimes available
  appointments?: Appointment[];
  availabilities?: Availability[];
  computed_properties?: {
    total_hours_available: number;
    total_hours: number;
    total_hours_by_day: number[];
    is_maxed_on_sessions: boolean;
  };
};
