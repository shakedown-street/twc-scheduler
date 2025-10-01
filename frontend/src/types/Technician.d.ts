type Technician = {
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
  is_manually_maxed_out: boolean;

  // Sometimes available
  appointments?: Appointment[];
  availabilities?: Availability[];
};
