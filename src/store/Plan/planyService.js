import axios from "axios";
import { base_url } from "../../constants/axiosConfig";

const API_URL = `${base_url}/api/plans`;

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const planService = {
  getMyPlans: async (type) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}?type=${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  },

  createPlan: async (planData) => {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/`, planData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deletePlan: async (id) => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return id;
  },

  updatePlan: async (id, updatedData) => {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getPlanByDate: async (type) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/date?type=${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateToVisited: async (id, region, data) => {
    const token = getAuthToken();
    const response = await axios.put(
      `${API_URL}/complete/${id}/${region}`,
      {
        visitedLatitude: data.visitedLatitude,
        visitedLongitude: data.visitedLongitude,
      },
      {
        headers: {
          Authorization: `Beerar ${token}`,
        },
      }
    );
    return response;
  },

  unVisitRegion: async (id, region) => {
    const token = getAuthToken();
    const response = await axios.put(
      `${API_URL}/unvisit/${id}/${region}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  },

  getMonthlyPlans: async (startDate, endDate, userId) => {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_URL}/monthly?startDate=${startDate}&endDate=${endDate}&userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  filterPlans: async (query) => {
    const response = await axios.get(`${API_URL}/me/filter`, { params: query });
    return response.data;
  },

  addManagerNote: async (id, note) => {
    const response = await axios.put(`${API_URL}/manager-note/${id}`, { note });
    return response.data;
  },

  getPlansByHierarchy: async () => {
    const response = await axios.get(`${API_URL}/hierarchy`);
    return response.data;
  },
};

export default planService;
