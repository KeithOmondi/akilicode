// frontend/src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import api from '../../api/api';
import type { IParentalConsentRecord,
    IUser,
  AuthState,
  RegisterPayload,
  LoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
  UpdateConsentPayload,
  AuthResponse,
  UserResponse,
  MessageResponse,
  ConsentResponse,
 } from '../../interfaces/user.interface';
import type { IKid, KidResponse, KidsListResponse, KidState, RegisterKidPayload } from '../../interfaces/kid.interface';

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string; status?: string }>;
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};

// ─── AUTH THUNKS ─────────────────────────────────────────────────────────────

export const registerParent = createAsyncThunk<
  AuthResponse['data'],
  RegisterPayload,
  { rejectValue: string }
>('user/registerParent', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const loginParent = createAsyncThunk<
  AuthResponse['data'],
  LoginPayload,
  { rejectValue: string }
>('user/loginParent', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const loginKid = createAsyncThunk<
  { kid: IKid; token: string },
  { username: string; pin: string },
  { rejectValue: string }
>('user/loginKid', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<{ status: string; data: { kid: IKid; token: string } }>(
      '/auth/kid/login',
      payload
    );
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('role', 'kid');
    }
    return response.data.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const logoutKid = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('user/logoutKid', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/kid/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const verifyEmail = createAsyncThunk<
  MessageResponse,
  string,
  { rejectValue: string }
>('user/verifyEmail', async (token, { rejectWithValue }) => {
  try {
    const response = await api.get<MessageResponse>(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const resendVerification = createAsyncThunk<
  MessageResponse,
  { email: string },
  { rejectValue: string }
>('user/resendVerification', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<MessageResponse>('/auth/resend-verification', payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const forgotPassword = createAsyncThunk<
  MessageResponse,
  ForgotPasswordPayload,
  { rejectValue: string }
>('user/forgotPassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<MessageResponse>('/auth/forgot-password', payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const resetPassword = createAsyncThunk<
  MessageResponse,
  ResetPasswordPayload,
  { rejectValue: string }
>('user/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const response = await api.post<MessageResponse>(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// ─── PROFILE THUNKS ──────────────────────────────────────────────────────────

export const getParentProfile = createAsyncThunk<
  IUser,
  void,
  { rejectValue: string }
>('user/getParentProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<UserResponse>('/parent/profile');
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const updateParentProfile = createAsyncThunk<
  IUser,
  UpdateProfilePayload,
  { rejectValue: string }
>('user/updateParentProfile', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.patch<UserResponse>('/parent/profile', payload);
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const changePassword = createAsyncThunk<
  MessageResponse,
  ChangePasswordPayload,
  { rejectValue: string }
>('user/changePassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.patch<MessageResponse>('/parent/change-password', payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const requestAccountDeletion = createAsyncThunk<
  MessageResponse,
  void,
  { rejectValue: string }
>('user/requestAccountDeletion', async (_, { rejectWithValue }) => {
  try {
    const response = await api.delete<MessageResponse>('/parent/account');
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// ─── TWO-FACTOR THUNKS ───────────────────────────────────────────────────────

export const enableTwoFactor = createAsyncThunk<
  MessageResponse,
  void,
  { rejectValue: string }
>('user/enableTwoFactor', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post<MessageResponse>('/parent/2fa/enable');
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const disableTwoFactor = createAsyncThunk<
  MessageResponse,
  { password: string },
  { rejectValue: string }
>('user/disableTwoFactor', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<MessageResponse>('/parent/2fa/disable', payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// ─── KID MANAGEMENT THUNKS ───────────────────────────────────────────────────

export const createKidAccount = createAsyncThunk<
  IKid,
  RegisterKidPayload & { username: string; pin: string },
  { rejectValue: string }
>('user/createKidAccount', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<KidResponse>('/parent/kids', payload);
    return response.data.data.kid;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const getParentKids = createAsyncThunk<
  IKid[],
  void,
  { rejectValue: string }
>('user/getParentKids', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<KidsListResponse>('/parent/kids');
    return response.data.data.kids;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const getKidById = createAsyncThunk<
  IKid,
  string,
  { rejectValue: string }
>('user/getKidById', async (kidId, { rejectWithValue }) => {
  try {
    const response = await api.get<KidResponse>(`/parent/kids/${kidId}`);
    return response.data.data.kid;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const updateKidProfile = createAsyncThunk<
  IKid,
  { kidId: string; data: Partial<Pick<IKid, 'name' | 'grade' | 'avatar'>> },
  { rejectValue: string }
>('user/updateKidProfile', async ({ kidId, data }, { rejectWithValue }) => {
  try {
    const response = await api.patch<KidResponse>(`/parent/kids/${kidId}`, data);
    return response.data.data.kid;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const deleteKidAccount = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('user/deleteKidAccount', async (kidId, { rejectWithValue }) => {
  try {
    await api.delete<MessageResponse>(`/parent/kids/${kidId}`);
    return kidId;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const updateKidPin = createAsyncThunk<
  MessageResponse,
  { kidId: string; pin: string },
  { rejectValue: string }
>('user/updateKidPin', async ({ kidId, pin }, { rejectWithValue }) => {
  try {
    const response = await api.patch<MessageResponse>(`/parent/kids/${kidId}/pin`, { pin });
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const unlockKidPin = createAsyncThunk<
  MessageResponse,
  string,
  { rejectValue: string }
>('user/unlockKidPin', async (kidId, { rejectWithValue }) => {
  try {
    const response = await api.post<MessageResponse>(`/parent/kids/${kidId}/pin/unlock`);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const updateKidSessionTimeout = createAsyncThunk<
  MessageResponse,
  { kidId: string; session_timeout_minutes: number },
  { rejectValue: string }
>('user/updateKidSessionTimeout', async ({ kidId, session_timeout_minutes }, { rejectWithValue }) => {
  try {
    const response = await api.patch<MessageResponse>(`/parent/kids/${kidId}/session`, { session_timeout_minutes });
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// ─── CONSENT THUNKS ──────────────────────────────────────────────────────────

export const revokeConsent = createAsyncThunk<
  MessageResponse,
  string,
  { rejectValue: string }
>('user/revokeConsent', async (kidId, { rejectWithValue }) => {
  try {
    const response = await api.delete<MessageResponse>(`/parent/kids/${kidId}/consent`);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// FIXED: Replaced 'any' with proper type 'IParentalConsentRecord'
export const updateGranularConsent = createAsyncThunk<
  IParentalConsentRecord,
  { kidId: string; payload: UpdateConsentPayload },
  { rejectValue: string }
>('user/updateGranularConsent', async ({ kidId, payload }, { rejectWithValue }) => {
  try {
    const response = await api.patch<ConsentResponse>(`/parent/kids/${kidId}/consent`, payload);
    return response.data.data.consent;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// ─── ADMIN THUNKS ────────────────────────────────────────────────────────────

export const getAllUsers = createAsyncThunk<
  IUser[],
  void,
  { rejectValue: string }
>('user/getAllUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<{ status: string; results: number; data: { users: IUser[] } }>(
      '/admin/users'
    );
    return response.data.data.users;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const getUserById = createAsyncThunk<
  IUser,
  string,
  { rejectValue: string }
>('user/getUserById', async (userId, { rejectWithValue }) => {
  try {
    const response = await api.get<UserResponse>(`/admin/users/${userId}`);
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const updateUserRole = createAsyncThunk<
  IUser,
  { userId: string; role: 'admin' | 'parent' },
  { rejectValue: string }
>('user/updateUserRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    const response = await api.patch<UserResponse>(`/admin/users/${userId}/role`, { role });
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const adminDeleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('user/adminDeleteUser', async (userId, { rejectWithValue }) => {
  try {
    await api.delete<MessageResponse>(`/admin/users/${userId}`);
    return userId;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

// ─── INITIAL STATE ───────────────────────────────────────────────────────────

const initialAuthState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  message: null,
};

const initialKidsState: KidState = {
  kids: [],
  currentKid: null,
  loading: false,
  error: null,
  message: null,
};

interface UserSliceState {
  auth: AuthState;
  kids: KidState;
  adminUsers: IUser[];
  adminLoading: boolean;
  adminError: string | null;
}

const initialState: UserSliceState = {
  auth: initialAuthState,
  kids: initialKidsState,
  adminUsers: [],
  adminLoading: false,
  adminError: null,
};

// ─── SLICE ───────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.auth.error = null;
    },
    clearAuthMessage: (state) => {
      state.auth.message = null;
    },
    clearKidsError: (state) => {
      state.kids.error = null;
    },
    clearKidsMessage: (state) => {
      state.kids.message = null;
    },
    setCurrentKid: (state, action: PayloadAction<IKid | null>) => {
      state.kids.currentKid = action.payload;
    },
    logout: (state) => {
      state.auth.user = null;
      state.auth.token = null;
      state.auth.message = null;
      state.auth.error = null;
      state.kids = initialKidsState;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    },
    clearAdminError: (state) => {
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    // ─── REGISTER ──────────────────────────────────────────────────────────
    builder
      .addCase(registerParent.pending, (state) => {
        state.auth.loading = true;
        state.auth.error = null;
      })
      .addCase(registerParent.fulfilled, (state, action) => {
        state.auth.loading = false;
        state.auth.user = action.payload.user;
        state.auth.token = action.payload.token;
        state.auth.message = 'Registration successful! Please check your email to verify your account.';
      })
      .addCase(registerParent.rejected, (state, action) => {
        state.auth.loading = false;
        state.auth.error = action.payload || 'Registration failed';
      })

      // ─── LOGIN PARENT ────────────────────────────────────────────────────
      .addCase(loginParent.pending, (state) => {
        state.auth.loading = true;
        state.auth.error = null;
      })
      .addCase(loginParent.fulfilled, (state, action) => {
        state.auth.loading = false;
        state.auth.user = action.payload.user;
        state.auth.token = action.payload.token;
      })
      .addCase(loginParent.rejected, (state, action) => {
        state.auth.loading = false;
        state.auth.error = action.payload || 'Login failed';
      })

      // ─── LOGIN KID ───────────────────────────────────────────────────────
      .addCase(loginKid.pending, (state) => {
        state.auth.loading = true;
        state.auth.error = null;
      })
      .addCase(loginKid.fulfilled, (state, action) => {
        state.auth.loading = false;
        state.kids.currentKid = action.payload.kid;
        state.auth.token = action.payload.token;
      })
      .addCase(loginKid.rejected, (state, action) => {
        state.auth.loading = false;
        state.auth.error = action.payload || 'Kid login failed';
      })

      // ─── LOGOUT KID ──────────────────────────────────────────────────────
      .addCase(logoutKid.fulfilled, (state) => {
        state.kids.currentKid = null;
        if (state.auth.user?.role !== 'parent') {
          state.auth.user = null;
          state.auth.token = null;
        }
      })

      // ─── GET PROFILE ─────────────────────────────────────────────────────
      .addCase(getParentProfile.pending, (state) => {
        state.auth.loading = true;
        state.auth.error = null;
      })
      .addCase(getParentProfile.fulfilled, (state, action) => {
        state.auth.loading = false;
        state.auth.user = action.payload;
      })
      .addCase(getParentProfile.rejected, (state, action) => {
        state.auth.loading = false;
        state.auth.error = action.payload || 'Failed to load profile';
      })

      // ─── UPDATE PROFILE ──────────────────────────────────────────────────
      .addCase(updateParentProfile.fulfilled, (state, action) => {
        state.auth.user = action.payload;
        state.auth.message = 'Profile updated successfully';
      })
      .addCase(updateParentProfile.rejected, (state, action) => {
        state.auth.error = action.payload || 'Failed to update profile';
      })

      // ─── CHANGE PASSWORD ─────────────────────────────────────────────────
      .addCase(changePassword.fulfilled, (state, action) => {
        state.auth.message = action.payload.message;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.auth.error = action.payload || 'Failed to change password';
      })

      // ─── VERIFY EMAIL ────────────────────────────────────────────────────
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.auth.message = action.payload.message;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.auth.error = action.payload || 'Email verification failed';
      })

      // ─── FORGOT PASSWORD ─────────────────────────────────────────────────
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.auth.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.auth.error = action.payload || 'Failed to send reset email';
      })

      // ─── RESET PASSWORD ──────────────────────────────────────────────────
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.auth.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.auth.error = action.payload || 'Failed to reset password';
      })

      // ─── KID MANAGEMENT ──────────────────────────────────────────────────
      .addCase(createKidAccount.pending, (state) => {
        state.kids.loading = true;
        state.kids.error = null;
      })
      .addCase(createKidAccount.fulfilled, (state, action) => {
        state.kids.loading = false;
        state.kids.kids.push(action.payload);
        state.kids.message = 'Kid account created successfully';
      })
      .addCase(createKidAccount.rejected, (state, action) => {
        state.kids.loading = false;
        state.kids.error = action.payload || 'Failed to create kid account';
      })

      .addCase(getParentKids.pending, (state) => {
        state.kids.loading = true;
        state.kids.error = null;
      })
      .addCase(getParentKids.fulfilled, (state, action) => {
        state.kids.loading = false;
        state.kids.kids = action.payload;
      })
      .addCase(getParentKids.rejected, (state, action) => {
        state.kids.loading = false;
        state.kids.error = action.payload || 'Failed to load kids';
      })

      .addCase(getKidById.pending, (state) => {
        state.kids.loading = true;
        state.kids.error = null;
      })
      .addCase(getKidById.fulfilled, (state, action) => {
        state.kids.loading = false;
        state.kids.currentKid = action.payload;
      })
      .addCase(getKidById.rejected, (state, action) => {
        state.kids.loading = false;
        state.kids.error = action.payload || 'Failed to load kid';
      })

      .addCase(updateKidProfile.fulfilled, (state, action) => {
        const index = state.kids.kids.findIndex((kid) => kid.id === action.payload.id);
        if (index !== -1) {
          state.kids.kids[index] = action.payload;
        }
        if (state.kids.currentKid?.id === action.payload.id) {
          state.kids.currentKid = action.payload;
        }
        state.kids.message = 'Kid profile updated successfully';
      })

      .addCase(deleteKidAccount.fulfilled, (state, action) => {
        state.kids.kids = state.kids.kids.filter((kid) => kid.id !== action.payload);
        if (state.kids.currentKid?.id === action.payload) {
          state.kids.currentKid = null;
        }
        state.kids.message = 'Kid account deleted successfully';
      })

      .addCase(updateKidPin.fulfilled, (state, action) => {
        state.kids.message = action.payload.message;
      })

      .addCase(unlockKidPin.fulfilled, (state, action) => {
        state.kids.message = action.payload.message;
      })

      // ─── ADMIN ───────────────────────────────────────────────────────────
      .addCase(getAllUsers.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminUsers = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload || 'Failed to load users';
      })

      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.adminUsers.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.adminUsers[index] = action.payload;
        }
      })

      .addCase(adminDeleteUser.fulfilled, (state, action) => {
        state.adminUsers = state.adminUsers.filter((user) => user.id !== action.payload);
      });
  },
});

export const {
  clearAuthError,
  clearAuthMessage,
  clearKidsError,
  clearKidsMessage,
  setCurrentKid,
  logout,
  clearAdminError,
} = userSlice.actions;

export default userSlice.reducer;