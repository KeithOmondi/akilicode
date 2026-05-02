import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import enrollmentReducer from "./slices/enrollmentSlice"
import  kidReducer from "./slices/kidSlice"
import paymentReducer from "./slices/paymentSlice"
import courseReducer from "./slices/courseSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    enrollment: enrollmentReducer,
    kid: kidReducer,
    payment: paymentReducer,
    course: courseReducer
    // other reducers go here
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;