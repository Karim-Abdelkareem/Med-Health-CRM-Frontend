import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import planService from "./planService";

const initialState = {
  plans: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Thunks using the service

export const getMyPlans = createAsyncThunk(
  "plans/getMyPlans",
  async (_, thunkAPI) => {
    try {
      return await planService.getMyPlans();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createPlan = createAsyncThunk(
  "plans/create",
  async (planData, thunkAPI) => {
    try {
      return await planService.createPlan(planData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const deletePlan = createAsyncThunk(
  "plans/delete",
  async (id, thunkAPI) => {
    try {
      await planService.deletePlan(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updatePlan = createAsyncThunk(
  "plans/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await planService.updatePlan(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const filterPlans = createAsyncThunk(
  "plans/filter",
  async (query, thunkAPI) => {
    try {
      return await planService.filterPlans(query);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const addManagerNote = createAsyncThunk(
  "plans/addManagerNote",
  async ({ id, note }, thunkAPI) => {
    try {
      return await planService.addManagerNote(id, note);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getPlansByHierarchy = createAsyncThunk(
  "plans/getByHierarchy",
  async (_, thunkAPI) => {
    try {
      return await planService.getPlansByHierarchy();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const planSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    resetPlanState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // getMyPlans
      .addCase(getMyPlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.plans = action.payload;
      })
      .addCase(getMyPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // createPlan
      .addCase(createPlan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.plans.push(action.payload.data); // `data` because service returns { success, data, ... }
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // deletePlan
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((plan) => plan._id !== action.payload);
      })

      // updatePlan
      .addCase(updatePlan.fulfilled, (state, action) => {
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) {
          state.plans[idx] = action.payload;
        }
      })

      // filterPlans
      .addCase(filterPlans.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.plans = action.payload;
      })

      // addManagerNote
      .addCase(addManagerNote.fulfilled, (state, action) => {
        const idx = state.plans.findIndex(
          (p) => p._id === action.payload.plan._id
        );
        if (idx !== -1) {
          state.plans[idx] = action.payload.plan;
        }
      })

      // getPlansByHierarchy
      .addCase(getPlansByHierarchy.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.plans = action.payload;
      });
  },
});

export const { resetPlanState } = planSlice.actions;
export default planSlice.reducer;
