import axios from "axios";
import { base_url } from "../../constants/axiosConfig";

const API_URL = `${base_url}/api/users`;

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const userService = {
  getAllUsers: async () => {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getUserById: async (id) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createUser: async (userData) => {
    const token = getAuthToken();
    const response = await axios.post(API_URL, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateUser: async (id, updatedData) => {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return id;
  },

  getUserProfile: async () => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getUsersByRole: async (role) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/get/role?role=${role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default userService;
