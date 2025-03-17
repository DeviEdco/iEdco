import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ReviewsState {
  items: Review[];
  selectedReview: Review | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReviewsState = {
  items: [],
  selectedReview: null,
  status: 'idle',
  error: null
};

export const fetchReviews = createAsyncThunk(
  'adminReviews/fetchReviews',
  async (params?: { status?: string, productId?: string, rating?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.rating) queryParams.append('rating', params.rating);
    
    const response = await axios.get(`/api/admin/reviews?${queryParams.toString()}`);
    return response.data;
  }
);

export const fetchReviewById = createAsyncThunk(
  'adminReviews/fetchReviewById',
  async (id: string) => {
    const response = await axios.get(`/api/admin/reviews/${id}`);
    return response.data;
  }
);

export const updateReviewApproval = createAsyncThunk(
  'adminReviews/updateReviewApproval',
  async ({ id, isApproved }: { id: string, isApproved: boolean }) => {
    const response = await axios.put(`/api/admin/reviews/${id}`, { isApproved });
    return response.data;
  }
);

export const deleteReview = createAsyncThunk(
  'adminReviews/deleteReview',
  async (id: string) => {
    await axios.delete(`/api/admin/reviews/${id}`);
    return id;
  }
);

const reviewsSlice = createSlice({
  name: 'adminReviews',
  initialState,
  reducers: {
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      .addCase(fetchReviewById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviewById.fulfilled, (state, action: PayloadAction<Review>) => {
        state.status = 'succeeded';
        state.selectedReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch review';
      })
      .addCase(updateReviewApproval.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.items.findIndex(review => review.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedReview?.id === action.payload.id) {
          state.selectedReview = action.payload;
        }
      })
      .addCase(deleteReview.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(review => review.id !== action.payload);
        if (state.selectedReview?.id === action.payload) {
          state.selectedReview = null;
        }
      });
  }
});

export const { clearSelectedReview } = reviewsSlice.actions;
export default reviewsSlice.reducer;