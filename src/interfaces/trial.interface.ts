// Frontend Trial Interfaces

export interface TrialAccess {
  id: string;
  kid_id: string;
  course_id: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'converted';
  created_at: string;
  updated_at: string;
}

export interface TrialWithDetails extends TrialAccess {
  kid_name?: string;
  course_title?: string;
  course_description?: string;
  trial_duration_days: number;
  days_remaining: number;
  is_expiring_soon: boolean;
}

export interface StartTrialRequest {
  kid_id: string;
  course_id: string;
}

export interface StartTrialResponse {
  status: string;
  data: {
    trial: TrialWithDetails;
  };
}

export interface CheckTrialResponse {
  status: string;
  data: {
    hasActiveTrial: boolean;
    trial?: TrialWithDetails;
  };
}

export interface GetActiveTrialsResponse {
  status: string;
  results: number;
  data: {
    trials: TrialWithDetails[];
  };
}

export interface ConvertTrialRequest {
  trial_id: string;
  enrollment_id: string;
}

export interface ConvertTrialResponse {
  status: string;
  message: string;
}

export interface TrialSummary {
  active_trials: number;
  kids_with_trials: number;
  min_days_remaining: number | null;
}

export interface TrialSummaryResponse {
  status: string;
  data: {
    summary: TrialSummary;
  };
}

// Utility functions for trial calculations
export const calculateDaysRemaining = (expiresAt: string | Date): number => {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const isExpiringSoon = (expiresAt: string | Date, thresholdDays: number = 2): boolean => {
  const daysRemaining = calculateDaysRemaining(expiresAt);
  return daysRemaining <= thresholdDays && daysRemaining > 0;
};

export const hasTrialExpired = (expiresAt: string | Date): boolean => {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  return expiry < now;
};

export const getTrialProgress = (startedAt: string | Date, expiresAt: string | Date): number => {
  const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  
  const totalDuration = expiry.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  if (elapsed <= 0) return 0;
  if (elapsed >= totalDuration) return 100;
  
  return (elapsed / totalDuration) * 100;
};

export const formatTrialTimeRemaining = (expiresAt: string | Date): string => {
  const daysRemaining = calculateDaysRemaining(expiresAt);
  
  if (daysRemaining === 0) {
    return 'Less than 24 hours';
  } else if (daysRemaining === 1) {
    return '1 day';
  } else {
    return `${daysRemaining} days`;
  }
};

export const getTrialStatusMessage = (expiresAt: string | Date): string => {
  const daysRemaining = calculateDaysRemaining(expiresAt);
  
  if (daysRemaining <= 0) {
    return 'Your free trial has expired. Subscribe now to continue learning!';
  } else if (daysRemaining === 1) {
    return 'Your free trial ends tomorrow! Subscribe now to continue your learning journey.';
  } else if (daysRemaining <= 3) {
    return `Your free trial ends in ${daysRemaining} days. Don't miss out - subscribe today!`;
  } else {
    return `You have ${daysRemaining} days left in your free trial. Enjoy learning!`;
  }
};

export const getTrialStatusColor = (expiresAt: string | Date): string => {
  const daysRemaining = calculateDaysRemaining(expiresAt);
  
  if (daysRemaining <= 0) return 'red';
  if (daysRemaining <= 2) return 'orange';
  if (daysRemaining <= 5) return 'yellow';
  return 'green';
};