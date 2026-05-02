// Matches the kids table columns returned by RETURNING *
export interface Kid {
  id: string;
  parent_id: string;
  name: string;
  age: number;
  grade: string | null; // optional on register, nullable in DB
  created_at: string;
  updated_at?: string;
}

export interface KidState {
  kids: Kid[];
  currentKid: Kid | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

// POST /kids/register — request body
export interface RegisterKidPayload {
  name: string;
  age: number;
  grade?: string;
}

// Single kid response — registerKid
// { status: 'success', data: { kid: Kid } }
export interface KidResponse {
  status: string;
  data: {
    kid: Kid;
  };
}

// List kids response — getMyKids
// { status: 'success', results: number, data: { kids: Kid[] } }
export interface KidsListResponse {
  status: string;
  results: number;
  data: {
    kids: Kid[];
  };
}