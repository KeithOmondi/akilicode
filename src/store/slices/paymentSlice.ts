import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type {
  PaymentState,
  Payment,
  Receipt,
  CreatePaymentPayload,
  StkPushPayload,
  PaymentResponse,
  PaymentsListResponse,
  ReceiptResponse,
  StkPushResponse,
} from "../../interfaces/payment.interface";
import api from "../../api/api";

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  receipt: null,
  checkoutRequestId: null,
  loading: false,
  error: null,
  message: null,
};

// ============ ASYNC THUNKS ============

// GET /payments/all — admin: Fetch every payment in the system
export const getAllPayments = createAsyncThunk<Payment[], void>(
  "payment/getAllPayments",
  async (_, thunkAPI) => {
    try {
      const res = await api.get<PaymentsListResponse>("/payments/all");
      return res.data.data.payments;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch global payments"
      );
    }
  }
);

// POST /payments/create — parent: manual payment entry
export const createPayment = createAsyncThunk<Payment, CreatePaymentPayload>(
  "payment/createPayment",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<PaymentResponse>("/payments/create", data);
      return res.data.data.payment;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create payment"
      );
    }
  }
);

// GET /payments/get — parent: all payments across their kids
export const getMyPayments = createAsyncThunk<Payment[], void>(
  "payment/getMyPayments",
  async (_, thunkAPI) => {
    try {
      const res = await api.get<PaymentsListResponse>("/payments/get");
      return res.data.data.payments;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch payments"
      );
    }
  }
);

// GET /payments/kid/:kidId — admin: payments for a specific kid
export const getKidPayments = createAsyncThunk<Payment[], string>(
  "payment/getKidPayments",
  async (kidId, thunkAPI) => {
    try {
      const res = await api.get<PaymentsListResponse>(`/payments/kid/${kidId}`);
      return res.data.data.payments;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch kid payments"
      );
    }
  }
);

// GET /payments/:paymentId/receipt — parent or admin
export const getReceipt = createAsyncThunk<Receipt, string>(
  "payment/getReceipt",
  async (paymentId, thunkAPI) => {
    try {
      const res = await api.get<ReceiptResponse>(`/payments/${paymentId}/receipt`);
      return res.data.data.receipt;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch receipt"
      );
    }
  }
);

// POST /mpesa/stk-push — parent: trigger M-Pesa STK push
export const initiateStkPush = createAsyncThunk<StkPushResponse, StkPushPayload>(
  "payment/initiateStkPush",
  async (data, thunkAPI) => {
    try {
      const res = await api.post<StkPushResponse>("/mpesa/stk-push", data);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to initiate M-Pesa payment"
      );
    }
  }
);

// ============ SLICE ============

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.error = null;
      state.message = null;
    },
    clearReceipt: (state) => {
      state.receipt = null;
    },
    clearCheckoutRequest: (state) => {
      state.checkoutRequestId = null;
      state.currentPayment = null;
    },
    markPaymentCompleted: (state, action: PayloadAction<string>) => {
      state.checkoutRequestId = null;
      state.message = "Payment confirmed successfully";
      state.payments = state.payments.map((p) =>
        p.reference === action.payload ? { ...p, status: "completed" } : p
      );
    },
    markPaymentFailed: (state, action: PayloadAction<string>) => {
      state.checkoutRequestId = null;
      state.error = "Payment was cancelled or failed. Please try again.";
      state.payments = state.payments.map((p) =>
        p.reference === action.payload ? { ...p, status: "failed" } : p
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Create Payment ──
      .addCase(createPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.payments.unshift(action.payload);
        state.message = "Payment recorded successfully";
      })

      // ── Unified Fetch Handlers (Shared logic for all list-fetching thunks) ──
      .addCase(getMyPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(getAllPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(getKidPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;
        state.payments = action.payload;
      })

      // ── Get Receipt ──
      .addCase(getReceipt.fulfilled, (state, action: PayloadAction<Receipt>) => {
        state.loading = false;
        state.receipt = action.payload;
      })

      // ── STK Push ──
      .addCase(initiateStkPush.fulfilled, (state, action: PayloadAction<StkPushResponse>) => {
        state.loading = false;
        state.checkoutRequestId = action.payload.data.CheckoutRequestID;
        state.message = action.payload.message;
      })

      // ── Global Matchers ──
      .addMatcher(
        (action) => action.type.startsWith("payment/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.message = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("payment/") && action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const {
  resetPaymentState,
  clearReceipt,
  clearCheckoutRequest,
  markPaymentCompleted,
  markPaymentFailed,
} = paymentSlice.actions;

export default paymentSlice.reducer;