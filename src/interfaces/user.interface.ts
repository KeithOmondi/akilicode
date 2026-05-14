export type UserRole = 'admin' | 'parent' | 'kid';
export type ConsentMethod =
  | 'credit_card'
  | 'email_plus'
  | 'signed_form'
  | 'video_call'
  | 'knowledge_auth';

// ─── USER ─────────────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_verified: boolean;
  created_at: Date;
  two_factor_enabled?: boolean;
  deletion_requested_at?: Date;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  birthDate: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

// ─── CONSENT ──────────────────────────────────────────────────────────────────

export interface IParentalConsentRecord {
  id: string;
  parent_id: string;
  kid_id: string;
  method: ConsentMethod;
  method_details: string;
  granted_at: Date;
  granted_ip: string;
  user_agent: string;
  version_of_policy: string;
  coppa_compliant: boolean;
  revoked_at?: Date;
  revoked_reason?: string;
  consented_to_analytics: boolean;
  consented_to_third_party: boolean;
  consented_to_personalization: boolean;
  consented_to_ip_collection: boolean;
}

export interface UpdateConsentPayload {
  analytics?: boolean;
  third_party?: boolean;
  personalization?: boolean;
  ip_collection?: boolean;
}

// ─── STATE ────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

// ─── RESPONSES ────────────────────────────────────────────────────────────────

export interface AuthResponse {
  status: string;
  data: {
    user: IUser;
    token: string;
  };
}

export interface UserResponse {
  status: string;
  data: { user: IUser };
}

export interface UsersListResponse {
  status: string;
  results: number;
  data: { users: IUser[] };
}

export interface ConsentResponse {
  status: string;
  data: { consent: IParentalConsentRecord };
}

export interface MessageResponse {
  status: string;
  message: string;
}