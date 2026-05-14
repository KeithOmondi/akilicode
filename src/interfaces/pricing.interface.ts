export type BillingCycle = 'monthly' | 'termly' | 'once-off';
export type DiscountType = 'percentage' | 'fixed';

export interface PublicPricingPlan {
  id:              string;
  name:            string;
  billing_cycle:   BillingCycle;
  price:           number;
  original_price:  number | null;
  duration_months: number;
  savings_percent: number | null;
  badge:           string | null;
  features:        string[];
}

export interface IPricingPlan extends PublicPricingPlan {
  is_active:  boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePricingPlanDTO {
  name:             string;
  billing_cycle:    BillingCycle;
  price:            number;
  original_price?:  number;
  duration_months:  number;
  savings_percent?: number;
  badge?:           string;
  features?:        string[];
  is_active?:       boolean;
  sort_order?:      number;
}

export interface UpdatePricingPlanDTO {
  name?:            string;
  billing_cycle?:   BillingCycle;
  price?:           number;
  original_price?:  number;
  duration_months?: number;
  savings_percent?: number;
  badge?:           string;
  features?:        string[];
  is_active?:       boolean;
  sort_order?:      number;
}

export interface ICoupon {
  id:             string;
  code:           string;
  description:    string | null;
  discount_type:  DiscountType;
  discount_value: number;
  applies_to:     'first_month' | 'all_months' | 'once';
  min_months:     number | null;
  max_uses:       number | null;
  uses_count:     number;
  valid_from:     string;
  valid_until:    string | null;
  is_active:      boolean;
  created_at:     string;
}

export interface CreateCouponDTO {
  code:           string;
  description?:   string;
  discount_type:  DiscountType;
  discount_value: number;
  applies_to?:    'first_month' | 'all_months' | 'once';
  min_months?:    number;
  max_uses?:      number;
  valid_from?:    string;
  valid_until?:   string;
  is_active?:     boolean;
}

export interface UpdateCouponDTO {
  description?:    string;
  discount_value?: number;
  applies_to?:     'first_month' | 'all_months' | 'once';
  min_months?:     number;
  max_uses?:       number;
  valid_until?:    string;
  is_active?:      boolean;
}

export interface ValidateCouponDTO {
  code:          string;
  billing_cycle: BillingCycle;
  plan_id:       string;
}

export interface CouponValidationResult {
  valid:            boolean;
  coupon?:          ICoupon;
  discount_amount?: number;
  final_price?:     number;
  message?:         string;
}

export interface PricingPageData {
  plans:      PublicPricingPlan[];
  trial_days: number;
  has_trial:  boolean;
}