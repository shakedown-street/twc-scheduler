import { BaseModel } from '~/http';
import { Appointment } from '~/types/Appointment';
import { Availability } from '~/types/Availability';
import { Block } from '~/types/Block';
import { Client } from '~/types/Client';
import { Technician } from '~/types/Technician';
import { User } from '~/types/User';

export const UserModel = new BaseModel<User>('/api/users/');
export const CheckoutSessionModel = new BaseModel<any>('/api/checkout-sessions/');
export const BillingSessionModel = new BaseModel<any>('/api/billing-sessions/');

export const AppointmentModel = new BaseModel<Appointment>('/api/appointments/');
export const AvailabilityModel = new BaseModel<Availability>('/api/availabilities/');
export const BlockModel = new BaseModel<Block>('/api/blocks/');
export const ClientModel = new BaseModel<Client>('/api/clients/');
export const TechnicianModel = new BaseModel<Technician>('/api/technicians/');
