import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { base_url } from "../constants/axiosConfig";

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${base_url}/api/notifications/stats`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const unreadStat = response.data.data.statusStats.find(
        (stat) => stat._id === "unread"
      );
      setUnreadCount(unreadStat ? unreadStat.count : 0);
    } catch {
      // Silently fail - we don't want to show errors for notification count
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Refresh count every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  return (
    <NotificationsContext.Provider
      value={{ unreadCount, updateUnreadCount, fetchUnreadCount }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
