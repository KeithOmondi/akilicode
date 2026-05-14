import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import enrollmentReducer from "./slices/enrollmentSlice"
import  kidReducer from "./slices/kidSlice"
import paymentReducer from "./slices/paymentSlice"
import courseReducer from "./slices/courseSlice"
import trialsReducer from "./slices/trialSlice"
import kidLearningReducer from "./slices/kidLearningSlice"
import codePlaygroundReducer from './slices/codePlaygroundSlice';
import pricingReducer from "./slices/pricingSlice"
import userReducer from "./slices/userSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    enrollment: enrollmentReducer,
    kid: kidReducer,
    payment: paymentReducer,
    course: courseReducer,
    trials: trialsReducer,
    kidLearning: kidLearningReducer,
    codePlayground: codePlaygroundReducer,
    pricing: pricingReducer,
    user: userReducer,
    // other reducers go here
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;