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
  created_at: Date;
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