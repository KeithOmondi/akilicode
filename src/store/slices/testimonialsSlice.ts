import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { testimonialService } from '../../components/service/testimonialService';
import type { Testimonial, TestimonialStats } from '../../interfaces/testimonial.interface';

// ─── State Type ─────────────────────────────────────────────────────────────
interface TestimonialsState {
  testimonials: Testimonial[];
  myTestimonials: Testimonial[];
  currentTestimonial: Testimonial | null;
  stats: TestimonialStats | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: TestimonialsState = {
  testimonials: [],
  myTestimonials: [],
  currentTestimonial: null,
  stats: null,
  loading: false,
  error: null,
  message: null,
  pagination: null,
};

// ─── Helper to extract error message ────────────────────────────────────────
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// ─── Async Thunks ───────────────────────────────────────────────────────────

// Get approved testimonials (public)
export const getApprovedTestimonials = createAsyncThunk(
  'testimonials/getApproved',
  async (params: { limit?: number; featured?: boolean; rating?: number } = {}, { rejectWithValue }) => {
    try {
      const testimonials = await testimonialService.getTestimonials(params);
      return testimonials;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get testimonial stats (public)
export const getTestimonialStats = createAsyncThunk(
  'testimonials/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await testimonialService.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Check if parent can leave testimonial
export const canLeaveTestimonial = createAsyncThunk(
  'testimonials/canLeave',
  async (kidId: string, { rejectWithValue }) => {
    try {
      const result = await testimonialService.canLeaveTestimonial(kidId);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Create testimonial
export const createTestimonial = createAsyncThunk(
  'testimonials/create',
  async (data: {
    kid_id: string;
    rating: number;
    title?: string;
    content: string;
    child_name?: string;
    child_age?: number;
    achievement?: string;
  }, { rejectWithValue }) => {
    try {
      const testimonial = await testimonialService.createTestimonial(data);
      return testimonial;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get my testimonials (parent)
export const getMyTestimonials = createAsyncThunk(
  'testimonials/getMy',
  async (_, { rejectWithValue }) => {
    try {
      const testimonials = await testimonialService.getMyTestimonials();
      return testimonials;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update testimonial
export const updateTestimonial = createAsyncThunk(
  'testimonials/update',
  async ({ testimonialId, data }: { testimonialId: string; data: Partial<Testimonial> }, { rejectWithValue }) => {
    try {
      const testimonial = await testimonialService.updateTestimonial(testimonialId, data);
      return testimonial;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete my testimonial (parent)
export const deleteMyTestimonial = createAsyncThunk(
  'testimonials/deleteMy',
  async (testimonialId: string, { rejectWithValue }) => {
    try {
      await testimonialService.deleteTestimonial(testimonialId);
      return testimonialId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Admin Thunks ───────────────────────────────────────────────────────────

// Get all testimonials (admin)
export const getAllTestimonials = createAsyncThunk(
  'testimonials/getAll',
  async (params: { status?: string; rating?: number; limit?: number; offset?: number } = {}, { rejectWithValue }) => {
    try {
      const data = await testimonialService.getAllTestimonials(params);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Approve testimonial (admin)
export const approveTestimonial = createAsyncThunk(
  'testimonials/approve',
  async ({ testimonialId, admin_note }: { testimonialId: string; admin_note?: string }, { rejectWithValue }) => {
    try {
      const testimonial = await testimonialService.approveTestimonial(testimonialId, admin_note);
      return testimonial;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Reject testimonial (admin)
export const rejectTestimonial = createAsyncThunk(
  'testimonials/reject',
  async ({ testimonialId, admin_note }: { testimonialId: string; admin_note: string }, { rejectWithValue }) => {
    try {
      const testimonial = await testimonialService.rejectTestimonial(testimonialId, admin_note);
      return testimonial;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Toggle featured (admin)
export const toggleFeatured = createAsyncThunk(
  'testimonials/toggleFeatured',
  async (testimonialId: string, { rejectWithValue }) => {
    try {
      const testimonial = await testimonialService.toggleFeatured(testimonialId);
      return testimonial;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Delete testimonial (admin)
export const deleteTestimonial = createAsyncThunk(
  'testimonials/delete',
  async (testimonialId: string, { rejectWithValue }) => {
    try {
      await testimonialService.deleteTestimonial(testimonialId);
      return testimonialId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────
const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {
    clearTestimonialsError: (state) => {
      state.error = null;
    },
    clearTestimonialsMessage: (state) => {
      state.message = null;
    },
    resetTestimonialsState: (state) => {
      state.testimonials = [];
      state.myTestimonials = [];
      state.currentTestimonial = null;
      state.stats = null;
      state.loading = false;
      state.error = null;
      state.message = null;
      state.pagination = null;
    },
    setCurrentTestimonial: (state, action: PayloadAction<Testimonial | null>) => {
      state.currentTestimonial = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── getApprovedTestimonials ──────────────────────────────────────────
      .addCase(getApprovedTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApprovedTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload;
      })
      .addCase(getApprovedTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── getTestimonialStats ──────────────────────────────────────────────
      .addCase(getTestimonialStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestimonialStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getTestimonialStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── createTestimonial ────────────────────────────────────────────────
      .addCase(createTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        state.myTestimonials.unshift(action.payload);
        state.message = 'Testimonial submitted successfully!';
      })
      .addCase(createTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── getMyTestimonials ────────────────────────────────────────────────
      .addCase(getMyTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.myTestimonials = action.payload;
      })
      .addCase(getMyTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── updateTestimonial ────────────────────────────────────────────────
      .addCase(updateTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myTestimonials.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.myTestimonials[index] = action.payload;
        }
        state.message = 'Testimonial updated successfully!';
      })
      .addCase(updateTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── deleteMyTestimonial ──────────────────────────────────────────────
      .addCase(deleteMyTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMyTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        state.myTestimonials = state.myTestimonials.filter(t => t.id !== action.payload);
        state.message = 'Testimonial deleted successfully!';
      })
      .addCase(deleteMyTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── getAllTestimonials (Admin) ───────────────────────────────────────
      .addCase(getAllTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload.testimonials;
        // Transform pagination to match state structure
        state.pagination = {
          page: Math.floor(action.payload.pagination.offset / action.payload.pagination.limit) + 1,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          pages: Math.ceil(action.payload.pagination.total / action.payload.pagination.limit)
        };
      })
      .addCase(getAllTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── approveTestimonial (Admin) ───────────────────────────────────────
      .addCase(approveTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.testimonials.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.testimonials[index] = action.payload;
        }
        state.message = 'Testimonial approved!';
      })
      .addCase(approveTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── rejectTestimonial (Admin) ────────────────────────────────────────
      .addCase(rejectTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.testimonials.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.testimonials[index] = action.payload;
        }
        state.message = 'Testimonial rejected.';
      })
      .addCase(rejectTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── toggleFeatured (Admin) ───────────────────────────────────────────
      .addCase(toggleFeatured.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.testimonials.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.testimonials[index] = action.payload;
        }
      })
      .addCase(toggleFeatured.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── deleteTestimonial (Admin) ────────────────────────────────────────
      .addCase(deleteTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = state.testimonials.filter(t => t.id !== action.payload);
        state.message = 'Testimonial deleted!';
      })
      .addCase(deleteTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ─── Exports ─────────────────────────────────────────────────────────────────
export const { 
  clearTestimonialsError, 
  clearTestimonialsMessage, 
  resetTestimonialsState,
  setCurrentTestimonial 
} = testimonialsSlice.actions;

export default testimonialsSlice.reducer;