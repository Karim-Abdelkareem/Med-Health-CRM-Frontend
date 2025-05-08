import axios from "axios";
import { base_url } from "../../constants/axiosConfig";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

export const notificationService = {
  // Get notifications with filters and pagination
  getNotifications: async (params) => {
    const queryParams = new URLSearchParams(params);
    const response = await axios.get(
      `${base_url}/api/notifications?${queryParams}`,
      getHeaders()
    );
    return response.data.data;
  },

  // Get notification statistics
  getStats: async () => {
    const response = await axios.get(
      `${base_url}/api/notifications/stats`,
      getHeaders()
    );
    return response.data.data;
  },

  // Update notification status
  updateStatus: async (notificationId, status) => {
    const response = await axios.patch(
      `${base_url}/api/notifications/${notificationId}`,
      { status },
      getHeaders()
    );
    return response.data.data;
  },

  // Batch update notifications
  batchUpdate: async (notificationIds, status) => {
    const response = await axios.patch(
      `${base_url}/api/notifications/batch/update`,
      { notificationIds, status },
      getHeaders()
    );
    return response.data.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await axios.delete(
      `${base_url}/api/notifications/${notificationId}`,
      getHeaders()
    );
    return response.data.data;
  },
};
