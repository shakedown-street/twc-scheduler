import { Appointment } from './Appointment';
import { Availability } from './Availability';

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
  is_maxed_on_sessions: boolean;
  total_hours: number;
  total_hours_by_day: number[];

  // Sometimes available
  appointments?: Appointment[];
  availabilities?: Availability[];
};
