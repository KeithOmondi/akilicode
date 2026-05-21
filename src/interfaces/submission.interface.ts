// src/interfaces/submission.interface.ts

export interface Submission {
  id: string;
  lesson_id: string;
  kid_id: string;
  parent_id: string;
  enrollment_id: string;
  github_url: string;
  status: 'submitted' | 'reviewed';
  marks: number | null;
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  // joined fields
  lesson_title?: string;
  lesson_assignment?: string;
  kid_name?: string;
  kid_avatar?: string;
  course_name?: string;
  reviewed_by_name?: string;
}

export interface SubmitAssignmentPayload {
  lesson_id: string;
  enrollment_id: string;
  github_url: string;
}

export interface ReviewSubmissionPayload {
  submissionId: string;
  marks: number;
  feedback?: string;
}

export interface SubmissionsListResponse {
  status: string;
  results: number;
  data: { submissions: Submission[] };
}

export interface SubmissionResponse {
  status: string;
  data: { submission: Submission };
}

export interface SubmissionState {
  submissions: Submission[];
  currentSubmission: Submission | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  message: string | null;
}