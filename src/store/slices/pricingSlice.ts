import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { pricingService } from "../../components/service/pricingService";
import type {
  PublicPricingPlan,
  CouponValidationResult,
  ValidateCouponDTO,
  PricingPageData,
} from "../../interfaces/pricing.interface";

interface PricingState {
  plans:             PublicPricingPlan[];
  trialDays:         number;
  hasTrial:          boolean;
  couponResult:      CouponValidationResult | null;
  selectedPlan:      PublicPricingPlan | null;
  loading:           boolean;
  couponLoading:     boolean;
  error:             string | null;
}

const initialState: PricingState = {
  plans:         [],
  trialDays:     5,
  hasTrial:      true,
  couponResult:  null,
  selectedPlan:  null,
  loading:       false,
  couponLoading: false,
  error:         null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchPublicPlans = createAsyncThunk<PricingPageData, void>(
  "pricing/fetchPublicPlans",
  async (_, thunkAPI) => {
    try {
      return await pricingService.getPublicPlans();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message ?? "Failed to load plans");
    }
  }
);

export const validateCoupon = createAsyncThunk<CouponValidationResult, ValidateCouponDTO>(
  "pricing/validateCoupon",
  async (payload, thunkAPI) => {
    try {
      return await pricingService.validateCoupon(payload);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message ?? "Failed to validate coupon");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    setSelectedPlan: (state, action: PayloadAction<PublicPricingPlan | null>) => {
      state.selectedPlan = action.payload;
      state.couponResult = null; // reset coupon when plan changes
    },
    clearCouponResult: (state) => {
      state.couponResult = null;
    },
    resetPricingState: (state) => {
      state.error        = null;
      state.couponResult = null;
      state.selectedPlan = null;
    },
  },
  extraReducers: (builder) => {
  builder
    .addCase(fetchPublicPlans.pending, (state) => {
      state.loading = true;
      state.error   = null;
    })
    .addCase(fetchPublicPlans.fulfilled, (state, action: PayloadAction<PricingPageData>) => {
      state.loading   = false;
      state.plans     = action.payload.plans;
      state.trialDays = action.payload.trial_days;
      state.hasTrial  = action.payload.has_trial;
    })
    .addCase(fetchPublicPlans.rejected, (state, action) => {
      state.loading = false;
      state.error   = (action.payload as string) ?? action.error.message ?? "Failed to load plans";
    })

    .addCase(validateCoupon.pending, (state) => {
      state.couponLoading = true;
    })
    .addCase(validateCoupon.fulfilled, (state, action: PayloadAction<CouponValidationResult>) => {
      state.couponLoading = false;
      state.couponResult  = action.payload;
    })
    .addCase(validateCoupon.rejected, (state, action) => {
      state.couponLoading = false;
      state.error = (action.payload as string) ?? action.error.message ?? "Failed to validate coupon";
    });
},
});

export const { setSelectedPlan, clearCouponResult, resetPricingState } = pricingSlice.actions;
export default pricingSlice.reducer;