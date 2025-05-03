import axios from "axios";
import { base_url } from "../../constants/axiosConfig";

const API_URL = `${base_url}/api/locations`;

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const locationService = {
  // Create a new location
  createLocation: async (locationData) => {
    const token = getAuthToken();
    const response = await axios.post(API_URL, locationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  },

  // Get all locations for current user
  getAllLocations: async () => {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get location by ID
  getLocationById: async (id) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update location
  updateLocation: async (id, updatedData) => {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Delete location
  deleteLocation: async (id) => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return id;
  },
};

export default locationService;
