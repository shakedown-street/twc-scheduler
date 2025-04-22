import { Appointment } from './Appointment';
import { Availability } from './Availability';
import { Technician } from './Technician';

export type Client = {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  eval_done: boolean;
  is_onboarding: boolean;
  prescribed_hours: number;
  req_skill_level: number;
  req_spanish_speaking: boolean;
  notes: string;
  sub_notes: string;
  current_technicians: Technician[];
  past_technicians: Technician[];

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
