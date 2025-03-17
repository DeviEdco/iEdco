import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface ProductImage {
  id: string;
  url: string;
}

interface ProductVariant {
  id: string;
  color: string;
  colorCode: string;
  size: string | null;
  stock: number;
  images?: ProductImage[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  hsnCode: string | null;
  categoryId: string;
  category?: {
    name: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductsState {
  items: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  categories: [],
  selectedProduct: null,
  status: 'idle',
  error: null
};

export const fetchProducts = createAsyncThunk(
  'adminProducts/fetchProducts',
  async (params?: { categoryId?: string, search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await axios.get(`/api/admin/products?${queryParams.toString()}`);
    return response.data;
  }
);

export const fetchCategories = createAsyncThunk(
  'adminProducts/fetchCategories',
  async () => {
    const response = await axios.get('/api/admin/categories');
    return response.data;
  }
);

export const fetchProductById = createAsyncThunk(
  'adminProducts/fetchProductById',
  async (id: string) => {
    const response = await axios.get(`/api/admin/products/${id}`);
    return response.data;
  }
);

export const addProduct = createAsyncThunk(
  'adminProducts/addProduct',
  async (formData: FormData) => {
    const response = await axios.post('/api/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  'adminProducts/updateProduct',
  async ({ id, formData }: { id: string, formData: FormData }) => {
    const response = await axios.put(`/api/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'adminProducts/deleteProduct',
  async (id: string) => {
    await axios.delete(`/api/admin/products/${id}`);
    return id;
  }
);

export const deleteProductImage = createAsyncThunk(
  'adminProducts/deleteProductImage',
  async ({ productId, imageId }: { productId: string, imageId: string }) => {
    await axios.delete(`/api/admin/products/${productId}/image/${imageId}`);
    return { productId, imageId };
  }
);

const productsSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products;
        state.categories = action.payload.categories;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.status = 'succeeded';
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch product';
      })
      .addCase(addProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const index = state.items.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.selectedProduct = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(product => product.id !== action.payload);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        const { productId, imageId } = action.payload;
        if (state.selectedProduct?.id === productId) {
          state.selectedProduct.images = state.selectedProduct.images.filter(
            image => image.id !== imageId
          );
        }
        
        const productIndex = state.items.findIndex(product => product.id === productId);
        if (productIndex !== -1) {
          state.items[productIndex].images = state.items[productIndex].images.filter(
            image => image.id !== imageId
          );
        }
      });
  }
});

export const { clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;