import axios from "axios";
import { base_url } from "../../constants/axiosConfig";

const API_URL = `${base_url}/api/monthly-plans`;

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const monthlyService = {
  // Create a new monthly plan
  createMonthlyPlan: async (monthlyData) => {
    const token = getAuthToken();
    const response = await axios.post(API_URL, monthlyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get all monthly plans for the current user
  getAllMonthlyPlans: async () => {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get a single monthly plan by ID
  getMonthlyPlanById: async (id) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update a monthly plan
  updateMonthlyPlan: async (id, updatedData) => {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Delete a monthly plan
  deleteMonthlyPlan: async (id) => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return id;
  },

  // Get Current Month Plan
  getCurrentMonthPlan: async () => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default monthlyService;
