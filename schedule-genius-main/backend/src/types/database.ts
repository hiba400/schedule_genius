// Types pour la base de données MySQL

export interface Module {
  id: number;
  name: string;
  code: string;
  type: string | null;
  nature: string | null;
  hours_cm: number;
  hours_td: number;
  hours_tp: number;
  created_at: Date;
}

export interface Professor {
  id: number;
  name: string;
  email: string;
  specialties: string | null;
  max_hours: number;
  created_at: Date;
}

export interface Room {
  id: number;
  name: string;
  type: string | null;
  capacity: number;
  equipment: string | null;
  created_at: Date;
}

export interface Program {
  id: number;
  name: string;
  level: string | null;
  created_at: Date;
}

export interface Group {
  id: number;
  program_id: number;
  name: string;
  size: number;
  created_at: Date;
}

export interface Availability {
  id: number;
  professor_id: number;
  day_of_week: number;
  slot_index: number;
  available: boolean;
}

export interface TimetableEntry {
  id: number;
  group_id: number;
  module_id: number;
  professor_id: number;
  room_id: number;
  day_of_week: number;
  slot_index: number;
  semester: string;
  created_at: Date;
}

export interface ConstraintRule {
  id: number;
  type: string;
  params: any; // JSON
  priority: number;
  created_at: Date;
}

// Types pour les insertions
export interface ModuleInsert {
  name: string;
  code: string;
  type?: string | null;
  nature?: string | null;
  hours_cm?: number;
  hours_td?: number;
  hours_tp?: number;
}

export interface ProfessorInsert {
  name: string;
  email: string;
  specialties?: string | null;
  max_hours?: number;
}

export interface RoomInsert {
  name: string;
  type?: string | null;
  capacity?: number;
  equipment?: string | null;
}

export interface ProgramInsert {
  name: string;
  level?: string | null;
}

export interface GroupInsert {
  program_id: number;
  name: string;
  size?: number;
}

export interface AvailabilityInsert {
  professor_id: number;
  day_of_week: number;
  slot_index: number;
  available: boolean;
}

