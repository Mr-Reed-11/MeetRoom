export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export type BookingStatus = 'active' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string;
  created_at: string;
  user?: User;
  room?: Room;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
