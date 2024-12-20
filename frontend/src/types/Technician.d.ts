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

  // Sometimes available
  availabilities?: Availability[];
};
