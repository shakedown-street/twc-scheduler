import { BaseModel } from '@/http';
import { Appointment } from '@/types/Appointment';
import { Availability } from '@/types/Availability';
import { Block } from '@/types/Block';
import { Client } from '@/types/Client';
import { Technician } from '@/types/Technician';
import { TherapyAppointment } from '@/types/TherapyAppointment';
import { User } from '@/types/User';

export const AppointmentModel = new BaseModel<Appointment>('/api/appointments/');
export const AvailabilityModel = new BaseModel<Availability>('/api/availabilities/');
export const BlockModel = new BaseModel<Block>('/api/blocks/');
export const ClientModel = new BaseModel<Client>('/api/clients/');
export const TechnicianModel = new BaseModel<Technician>('/api/technicians/');
export const TherapyAppointmentModel = new BaseModel<TherapyAppointment>('/api/therapy-appointments/');
export const UserModel = new BaseModel<User>('/api/users/');
