import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import holidayService from "./holidayService";

const initialState = {
  remainingDays: 0,
  holidayHistory: [],
  teamHolidays: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Get remaining holiday days
export const getRemainingDays = createAsyncThunk(
  "holiday/getRemainingDays",
  async (_, thunkAPI) => {
    try {
      return await holidayService.getRemainingDays();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get holiday history
export const getHolidayHistory = createAsyncThunk(
  "holiday/getHolidayHistory",
  async (_, thunkAPI) => {
    try {
      return await holidayService.getHolidayHistory();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create holiday request
export const createHolidayRequest = createAsyncThunk(
  "holiday/createRequest",
  async (holidayData, thunkAPI) => {
    try {
      return await holidayService.createHolidayRequest(holidayData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Cancel holiday request
export const cancelHolidayRequest = createAsyncThunk(
  "holiday/cancelRequest",
  async (id, thunkAPI) => {
    try {
      return await holidayService.cancelHolidayRequest(id);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get team holiday requests (for managers)
export const getTeamHolidayRequests = createAsyncThunk(
  "holiday/getTeamRequests",
  async (status, thunkAPI) => {
    try {
      return await holidayService.getTeamHolidayRequests(status);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update holiday request status (for managers)
export const updateHolidayRequestStatus = createAsyncThunk(
  "holiday/updateStatus",
  async ({ id, status, comment }, thunkAPI) => {
    try {
      return await holidayService.updateHolidayRequestStatus(
        id,
        status,
        comment
      );
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const holidaySlice = createSlice({
  name: "holiday",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Get remaining days
      .addCase(getRemainingDays.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRemainingDays.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.remainingDays = action.payload.remainingDays;
      })
      .addCase(getRemainingDays.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get holiday history
      .addCase(getHolidayHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHolidayHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.holidayHistory = action.payload;
      })
      .addCase(getHolidayHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Create holiday request
      .addCase(createHolidayRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createHolidayRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.holidayHistory = [action.payload, ...state.holidayHistory];
        state.remainingDays -= action.payload.days;
      })
      .addCase(createHolidayRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Cancel holiday request
      .addCase(cancelHolidayRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelHolidayRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const cancelledRequest = state.holidayHistory.find(
          (holiday) => holiday._id === action.payload._id
        );
        if (cancelledRequest && cancelledRequest.status === "Pending") {
          state.remainingDays += cancelledRequest.days;
        }
        state.holidayHistory = state.holidayHistory.filter(
          (holiday) => holiday._id !== action.payload._id
        );
      })
      .addCase(cancelHolidayRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get team holiday requests
      .addCase(getTeamHolidayRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTeamHolidayRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.teamHolidays = action.payload;
      })
      .addCase(getTeamHolidayRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update holiday request status
      .addCase(updateHolidayRequestStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateHolidayRequestStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.teamHolidays = state.teamHolidays.map((holiday) =>
          holiday._id === action.payload._id ? action.payload : holiday
        );
      })
      .addCase(updateHolidayRequestStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = holidaySlice.actions;
export default holidaySlice.reducer;
