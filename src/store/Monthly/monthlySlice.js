import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import monthlyService from "./monthlyService";

const initialState = {
  monthlyPlans: [],
  selectedPlan: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Thunks

export const getAllMonthlyPlans = createAsyncThunk(
  "monthly/getAll",
  async (_, thunkAPI) => {
    try {
      return await monthlyService.getAllMonthlyPlans();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createMonthlyPlan = createAsyncThunk(
  "monthly/create",
  async (planData, thunkAPI) => {
    try {
      return await monthlyService.createMonthlyPlan(planData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getMonthlyPlanById = createAsyncThunk(
  "monthly/getById",
  async (id, thunkAPI) => {
    try {
      return await monthlyService.getMonthlyPlanById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updateMonthlyPlan = createAsyncThunk(
  "monthly/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await monthlyService.updateMonthlyPlan(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const deleteMonthlyPlan = createAsyncThunk(
  "monthly/delete",
  async (id, thunkAPI) => {
    try {
      await monthlyService.deleteMonthlyPlan(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const monthlySlice = createSlice({
  name: "monthlyPlans",
  initialState,
  reducers: {
    resetMonthlyState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      state.selectedPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllMonthlyPlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllMonthlyPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.monthlyPlans = action.payload;
      })
      .addCase(getAllMonthlyPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(createMonthlyPlan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMonthlyPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.monthlyPlans.push(action.payload); // response is full plan object
      })
      .addCase(createMonthlyPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(getMonthlyPlanById.fulfilled, (state, action) => {
        state.selectedPlan = action.payload;
      })

      .addCase(updateMonthlyPlan.fulfilled, (state, action) => {
        const idx = state.monthlyPlans.findIndex(
          (plan) => plan._id === action.payload._id
        );
        if (idx !== -1) {
          state.monthlyPlans[idx] = action.payload;
        }
      })

      .addCase(deleteMonthlyPlan.fulfilled, (state, action) => {
        state.monthlyPlans = state.monthlyPlans.filter(
          (plan) => plan._id !== action.payload
        );
      });
  },
});

export const { resetMonthlyState } = monthlySlice.actions;
export default monthlySlice.reducer;
