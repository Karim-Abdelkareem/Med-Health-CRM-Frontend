import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { base_url } from "../constants/axiosConfig";

const API_URL = `${base_url}/api/users`;

const getAuthToken = () => localStorage.getItem("token");

// Helper to get headers
const getHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

// Fetch all users
export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, { headers: getHeaders() });
      return data;
    },
  });

// Fetch all employees
export const useEmployees = () =>
  useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/get/emp`, {
        headers: getHeaders(),
      });
      return data;
    },
  });

// Fetch user by ID
export const useUser = (id, options = {}) =>
  useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`, {
        headers: getHeaders(),
      });
      return data;
    },
    ...options,
  });

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await axios.post(API_URL, userData, {
        headers: getHeaders(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const { data } = await axios.put(`${API_URL}/${id}`, updatedData, {
        headers: getHeaders(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Get user profile
export const useUserProfile = () =>
  useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/profile`, {
        headers: getHeaders(),
      });
      return data;
    },
  });

// Get users by role
export const useUsersByRole = (role) =>
  useQuery({
    queryKey: ["usersByRole", role],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/get/role?role=${role}`, {
        headers: getHeaders(),
      });
      return data;
    },
    enabled: !!role,
  });

// Deactivate user
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const response = await axios.patch(
        `${API_URL}/deactivate/${userId}`,
        {},
        { headers: getHeaders() }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Update user password
export const useUpdateUserPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, passwordData }) => {
      const response = await axios.patch(
        `${API_URL}/change-password/${userId}`,
        passwordData,
        { headers: getHeaders() }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
