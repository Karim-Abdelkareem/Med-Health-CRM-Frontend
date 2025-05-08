import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "./notificationService";
import toast from "react-hot-toast";

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page, limit, ...filters }) => {
    const response = await notificationService.getNotifications({
      page,
      limit,
      ...filters,
    });
    return response;
  }
);

export const fetchStats = createAsyncThunk(
  "notifications/fetchStats",
  async () => {
    const response = await notificationService.getStats();
    return response;
  }
);

export const updateNotificationStatus = createAsyncThunk(
  "notifications/updateStatus",
  async ({ notificationId, status }) => {
    const response = await notificationService.updateStatus(
      notificationId,
      status
    );
    return response;
  }
);

export const batchUpdateNotifications = createAsyncThunk(
  "notifications/batchUpdate",
  async ({ notificationIds, status }) => {
    const response = await notificationService.batchUpdate(
      notificationIds,
      status
    );
    return response;
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId) => {
    const response = await notificationService.deleteNotification(
      notificationId
    );
    return response;
  }
);

const initialState = {
  notifications: [],
  stats: {
    statusStats: [],
    typeStats: [],
  },
  loading: false,
  currentPage: 1,
  totalPages: 1,
  selectedNotifications: [],
  filter: {
    status: "",
    type: "",
    priority: "",
  },
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setSelectedNotifications: (state, action) => {
      state.selectedNotifications = action.payload;
    },
    clearSelectedNotifications: (state) => {
      state.selectedNotifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.totalPages = action.payload.pagination.pages;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
        toast.error("Failed to load notifications");
      })
      // Fetch stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, () => {
        toast.error("Failed to load notification statistics");
      })
      // Update status
      .addCase(updateNotificationStatus.fulfilled, () => {
        toast.success("Notification status updated");
      })
      .addCase(updateNotificationStatus.rejected, () => {
        toast.error("Failed to update notification status");
      })
      // Batch update
      .addCase(batchUpdateNotifications.fulfilled, (state) => {
        state.selectedNotifications = [];
        toast.success("Selected notifications updated");
      })
      .addCase(batchUpdateNotifications.rejected, () => {
        toast.error("Failed to update notifications");
      })
      // Delete
      .addCase(deleteNotification.fulfilled, () => {
        toast.success("Notification deleted");
      })
      .addCase(deleteNotification.rejected, () => {
        toast.error("Failed to delete notification");
      });
  },
});

export const {
  setCurrentPage,
  setFilter,
  setSelectedNotifications,
  clearSelectedNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
