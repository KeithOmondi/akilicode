import api from "../../api/api";
import type {
  PricingPageData,
  CouponValidationResult,
  ValidateCouponDTO,
} from "../../interfaces/pricing.interface";

const getPublicPlans = async (): Promise<PricingPageData> => {
  const res = await api.get<{ status: string; data: PricingPageData }>("/pricing/plans");
  return res.data.data;
};

const validateCoupon = async (payload: ValidateCouponDTO): Promise<CouponValidationResult> => {
  const res = await api.post<{ status: string; data: CouponValidationResult }>(
    "/pricing/validate-coupon",
    payload
  );
  return res.data.data;
};

export const pricingService = { getPublicPlans, validateCoupon };