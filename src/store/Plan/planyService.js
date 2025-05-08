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

  updateToVisited: async (id, locationId, data) => {
    const token = getAuthToken();
    const response = await axios.put(
      `${API_URL}/complete/${id}/${locationId}`,
      {
        visitedLatitude: data.visitedLatitude,
        visitedLongitude: data.visitedLongitude,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

  addNotesToPlanLocation: async (planId, locationId, note) => {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_URL}/${planId}/locations/${locationId}/notes`,
      { note },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  editNoteInPlanLocation: async (planId, locationId, noteId, note) => {
    const token = getAuthToken();
    const response = await axios.patch(
      `${API_URL}/${planId}/locations/${locationId}/notes/${noteId}`,
      { note },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  deleteNoteInPlanLocation: async (planId, locationId, noteId) => {
    const token = getAuthToken();
    const response = await axios.delete(
      `${API_URL}/${planId}/locations/${locationId}/notes/${noteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  addRoleBasedNotesToPlan: async (planId, locationId, note) => {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_URL}/${planId}/locations/${locationId}/role-notes`,
      {
        note,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getPlanById: async (id) => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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

  markVisitIncomplete: async (planId, locationId, note) => {
    const token = getAuthToken();
    const response = await axios.put(
      `${API_URL}/incomplete/${planId}/${locationId}`,
      { note },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default planService;
