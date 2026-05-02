export interface User {
  id: string;        // ← backend uses 'id' (PostgreSQL), not '_id' (MongoDB)
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'parent'; // ← matches your backend: role === 'admin' ? 'admin' : 'parent'
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;
}

// Matches sendToken's exact response shape:
// { status: 'success', accessToken: '...', data: { user: { id, name, email, role } } }
export interface AuthResponse {
  status: string;
  accessToken: string;
  message?: string;
  data: {
    user: User;
  };
}