import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./UserService";

const initialState = {
  users: [],
  user: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Thunks

export const getAllUsers = createAsyncThunk(
  "users/getAll",
  async (_, thunkAPI) => {
    try {
      return await userService.getAllUsers();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getUserById = createAsyncThunk(
  "users/getById",
  async (id, thunkAPI) => {
    try {
      return await userService.getUserById(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, thunkAPI) => {
    try {
      return await userService.createUser(userData);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await userService.updateUser(id, data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, thunkAPI) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getUserProfile = createAsyncThunk(
  "users/profile",
  async (_, thunkAPI) => {
    try {
      return await userService.getUserProfile();
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getUsersByRole = createAsyncThunk(
  "users/byRole",
  async (role, thunkAPI) => {
    try {
      return await userService.getUsersByRole(role);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// Slice

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllUsers
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // getUserById
      .addCase(getUserById.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // createUser
      .addCase(createUser.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.users.push(action.payload.data);
      })

      // updateUser
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })

      // getUserProfile
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      // getUsersByRole
      .addCase(getUsersByRole.fulfilled, (state, action) => {
        console.log("Fetched users by role:", action.payload); // Log the payload
        state.users = action.payload;
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
