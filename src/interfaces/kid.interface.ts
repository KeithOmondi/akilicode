export interface IKid {
  id: string;
  parent_id: string;
  name: string;
  role: 'kid';
  age: number;
  grade?: string;
  avatar?: string;
  username?: string;
  has_pin?: boolean;
  birth_year?: number | null;
  screen_time_daily_minutes?: number | null;
  break_every_minutes?: number;
  pin_reset_required?: boolean;
  leaderboard_opt_in?: boolean;
  /** true until the parent has accepted the CURRENT consent wording for this child */
  needs_consent?: boolean;
  consent_version?: string | null;
  created_at: Date;
}


// src/interfaces/kidLearning.interface.ts
export interface Lesson {
  id: string;
  title: string;
  lesson_type: 'notes' | 'coding' | 'scratch';
  notes?: string;
  assignment?: string | null;   // ✨ add this
  language?: string;
  starter_code?: string;
  order_index: number;
  completed: boolean;
  points_earned: number;
}


export interface KidState {
  kids: IKid[];
  currentKid: IKid | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

export interface RegisterKidPayload {
  name: string;
  age: number;
  grade?: string;
  avatar?: string;
  /** The parent's consent: what they accepted, and in which version of the text. */
  consent: { accepted: true; is_guardian: true; version: string };
}

export interface SetKidLoginPayload {
  username: string;
  pin: string;
}

export interface UpdateKidLoginPayload {
  username?: string;
  pin?: string;
}

export interface KidLoginPayload {
  username: string;
  pin: string;
}

export interface KidResponse {
  status: string;
  data: { kid: IKid };
}

export interface KidsListResponse {
  status: string;
  results: number;
  data: { kids: IKid[] };
}