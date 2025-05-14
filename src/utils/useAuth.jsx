import axios from "axios";
import React, { useEffect, useState } from "react";
import { base_url } from "../constants/axiosConfig";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  async function checkAuth() {
    try {
      const response = await axios.get(`${base_url}/api/check-auth`, {
        withCredentials: true,
      });
      setIsAuthenticated(response.data.isAuthenticated);
    } catch (err) {
      console.error(err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return { isAuthenticated, loading };
}
