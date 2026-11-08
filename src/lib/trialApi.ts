import api from "../api/api";

/** Standard length of the free trial (the server decides; this is only the wording shown before it answers). */
export const TRIAL_DAYS = 7;

export interface TrialEligibility {
  trialDays: number;
  /** children who already used their one free trial */
  usedKidIds: Set<string>;
}

/** Which of my children can still start a free trial? (One trial per child.) */
export const fetchTrialEligibility = async (): Promise<TrialEligibility> => {
  try {
    const res = await api.get("/trials/eligibility");
    const d = res.data?.data as { trial_days: number; kids: { kid_id: string; used: boolean }[] };
    return { trialDays: d.trial_days || TRIAL_DAYS, usedKidIds: new Set(d.kids.filter((k) => k.used).map((k) => k.kid_id)) };
  } catch {
    // if we cannot tell, do not offer a trial that the server might refuse
    return { trialDays: TRIAL_DAYS, usedKidIds: new Set<string>() };
  }
};

/** Start the free trial for an unpaid enrollment. No payment is involved. */
export const startTrial = async (enrollmentId: string): Promise<{ duration_days: number; expires_at: string }> => {
  const res = await api.post("/trials/start", { enrollment_id: enrollmentId });
  return res.data.data.trial;
};
