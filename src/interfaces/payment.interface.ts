// Matches the payments table columns returned by RETURNING *
export interface Payment {
  id: string;
  enrollment_id: string;
  kid_id: string;
  parent_id: string;
  amount: number;
  method: 'M-Pesa' | 'Cash' | 'Bank Transfer' | string;
  reference: string | null;
  description: string | null;
  receipt_number: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  created_at?: string;
  // Joined fields from list/receipt queries
  kid_name?: string;
  course_name?: string;
  parent_name?: string;
}

// Matches getReceipt's dedicated receipt shape
export interface Receipt {
  receipt_number: string;
  date: string;
  parent_name: string;
  kid_name: string;
  course_name: string;
  amount: number;
  method: string;
  reference: string | null;
  description: string | null;
  status: 'pending' | 'completed' | 'failed';
}

export interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  receipt: Receipt | null;
  checkoutRequestId: string | null; // held while waiting for M-Pesa STK callback
  loading: boolean;
  error: string | null;
  message: string | null;
}

// POST / — request body
export interface CreatePaymentPayload {
  enrollment_id: string;
  amount: number;
  method: string;
  reference?: string;
  description?: string;
  date?: string;
}

// POST /mpesa/stk-push — request body
export interface StkPushPayload {
  enrollment_id: string;
  phone: string; // e.g. 2547XXXXXXXX
  amount: number;
}

// Single payment response — createPayment
// { status: 'success', data: { payment: Payment } }
export interface PaymentResponse {
  status: string;
  data: {
    payment: Payment;
  };
}

// List payments response — getMyPayments, getKidPayments
// { status: 'success', results: number, data: { payments: Payment[] } }
export interface PaymentsListResponse {
  status: string;
  results: number;
  data: {
    payments: Payment[];
  };
}

// Receipt response — getReceipt
// { status: 'success', data: { receipt: Receipt } }
export interface ReceiptResponse {
  status: string;
  data: {
    receipt: Receipt;
  };
}

// STK push response — POST /mpesa/stk-push
// { status: 'success', message: string, data: { CheckoutRequestID, MerchantRequestID } }
export interface StkPushResponse {
  status: string;
  message: string;
  data: {
    CheckoutRequestID: string;
    MerchantRequestID: string;
  };
}