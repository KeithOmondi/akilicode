// Matches the enrollments table columns returned by RETURNING *
// Update this in your interfaces section
export type PaymentStatus = 'unpaid' | 'paid' | 'due_soon' | 'overdue' | 'once-off' | 'cancelled';

export interface Enrollment {
  id: string;
  kid_id: string;
  parent_id: string;
  course_name: string;
  fee_amount: number;
  billing_cycle: 'monthly' | 'termly' | 'once-off';
  start_date: string;
  status: 'pending' | 'active' | 'cancelled' | 'completed';
  created_at: string;
  kid_name?: string;
  last_payment_date?: string | null;
  next_payment_date?: string | null;
  total_payments?: number;
  payment_status?: PaymentStatus;
}

export interface EnrollmentState {
  enrollments: Enrollment[];
  currentEnrollment: Enrollment | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

// POST /enrollments — request body
export interface EnrollKidPayload {
  kid_id: string;
  course_name: string;
  fee_amount: number;
  billing_cycle: 'monthly' | 'termly' | 'once-off'; // ← was 'yearly'
  start_date?: string;
}

// Single enrollment response — enrollKid, cancelEnrollment
// { status: 'success', data: { enrollment: Enrollment } }
export interface EnrollmentResponse {
  status: string;
  data: {
    enrollment: Enrollment;
  };
}

// List enrollment response — getMyEnrollments, getKidEnrollments
// { status: 'success', results: number, data: { enrollments: Enrollment[] } }
export interface EnrollmentsListResponse {
  status: string;
  results: number;
  data: {
    enrollments: Enrollment[];
  };
}