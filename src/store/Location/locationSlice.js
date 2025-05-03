import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import locationService from "./locationService";

const initialState = {
  locations: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Thunks using the locationService

export const getAllLocations = createAsyncThunk(
  "locations/getAllLocations",
  async (_, thunkAPI) => {
    try {
      return await locationService.getAllLocations();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createLocation = createAsyncThunk(
  "locations/create",
  async (locationData, thunkAPI) => {
    try {
      return await locationService.createLocation(locationData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const deleteLocation = createAsyncThunk(
  "locations/delete",
  async (id, thunkAPI) => {
    try {
      await locationService.deleteLocation(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updateLocation = createAsyncThunk(
  "locations/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await locationService.updateLocation(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const filterLocations = createAsyncThunk(
  "locations/filter",
  async (query, thunkAPI) => {
    try {
      return await locationService.filterLocations(query); // Assuming you have this method in locationService
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const locationSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    resetLocationState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllLocations
      .addCase(getAllLocations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.locations = action.payload;
      })
      .addCase(getAllLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // createLocation
      .addCase(createLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.locations.push(action.payload.data); // `data` from service
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // deleteLocation
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.locations = state.locations.filter(
          (location) => location._id !== action.payload
        );
      })

      // updateLocation
      .addCase(updateLocation.fulfilled, (state, action) => {
        const idx = state.locations.findIndex(
          (location) => location._id === action.payload._id
        );
        if (idx !== -1) {
          state.locations[idx] = action.payload;
        }
      })

      // filterLocations
      .addCase(filterLocations.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.locations = action.payload;
      });
  },
});

export const { resetLocationState } = locationSlice.actions;
export default locationSlice.reducer;
