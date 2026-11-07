// Admin "Users" list. (Parent accounts, children and sign-in live in authSlice and kidSlice.)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import api from '../../api/api';
import type { IUser, UserResponse } from '../../interfaces/user.interface';

const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string; status?: string }>;
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};

export const getAllUsers = createAsyncThunk<IUser[], void, { rejectValue: string }>(
  'user/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ status: string; results: number; data: { users: IUser[] } }>('/admin/users');
      return response.data.data.users;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateUserRole = createAsyncThunk<IUser, { userId: string; role: 'admin' | 'parent' }, { rejectValue: string }>(
  'user/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.patch<UserResponse>(`/admin/users/${userId}/role`, { role });
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const adminDeleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'user/adminDeleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

interface UserSliceState {
  adminUsers: IUser[];
  adminLoading: boolean;
  adminError: string | null;
}

const initialState: UserSliceState = { adminUsers: [], adminLoading: false, adminError: null };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
        const index = state.adminUsers.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.adminUsers[index] = action.payload;
      })
      .addCase(adminDeleteUser.rejected, (state, action) => {
        state.adminError = action.payload || 'Could not delete that user';
      })
      .addCase(adminDeleteUser.fulfilled, (state, action) => {
        state.adminUsers = state.adminUsers.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearAdminError } = userSlice.actions;
export default userSlice.reducer;
