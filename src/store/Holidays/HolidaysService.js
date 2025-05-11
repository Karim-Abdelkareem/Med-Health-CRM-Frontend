import axios from "axios";
import { base_url } from "../../constants/axiosConfig";

const API_URL = `${base_url}/api/holidays`;

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const holidayService = {
  // Get remaining holiday days for the current user
  getRemainingDays: async () => {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_URL}/calculate-remaining-holidays`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get holiday history for the current user
  getHolidayHistory: async () => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Submit a new holiday request
  createHolidayRequest: async (holidayData) => {
    const token = getAuthToken();
    const response = await axios.post(API_URL, holidayData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Cancel a pending holiday request
  cancelHolidayRequest: async (id) => {
    const token = getAuthToken();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // For managers: Get all holiday requests for team members
  getTeamHolidayRequests: async (status = "all") => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/team?status=${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // For managers: Approve or reject a holiday request
  updateHolidayRequestStatus: async (id, status, comment = "") => {
    const token = getAuthToken();
    const response = await axios.put(
      `${API_URL}/${id}/status`,
      { status, comment },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get holiday calendar (all approved holidays for team)
  getTeamHolidayCalendar: async (startDate, endDate) => {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_URL}/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get holiday statistics (used, remaining, etc.)
  getHolidayStatistics: async () => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getHolidayById: async (id) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/holiday/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  },
  approveRejectHoliday: async (id, status) => {
    const token = getAuthToken();
    const response = await axios.patch(
      `${API_URL}/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  },
  getUserHolidays: async (userId) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  },
};

export default holidayService;
