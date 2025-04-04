export type Availability = {
  id: string;
  created_at: string;
  updated_at: string;
  content_type: number;
  object_id: string;
  day: number;
  start_time: string;
  end_time: string;
  notes?: string;
  in_clinic?: boolean;
};
