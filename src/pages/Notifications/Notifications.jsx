import React, { useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiArchive,
  FiTrash2,
  FiAlertCircle,
  FiCalendar,
  FiMessageSquare,
  FiDollarSign,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { useNotifications } from "../../context/NotificationsContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  fetchStats,
  updateNotificationStatus,
  batchUpdateNotifications,
  deleteNotification,
  setCurrentPage,
  setFilter,
  setSelectedNotifications,
} from "../../store/notifications/notificationSlice";

export default function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { updateUnreadCount } = useNotifications();

  const {
    notifications,
    stats,
    loading,
    currentPage,
    totalPages,
    selectedNotifications,
    filter,
  } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: currentPage, limit: 20, ...filter }));
    dispatch(fetchStats());
  }, [dispatch, currentPage, filter]);

  useEffect(() => {
    // Update unread count in context when stats change
    const unreadStat = stats.statusStats.find((stat) => stat._id === "unread");
    updateUnreadCount(unreadStat ? unreadStat.count : 0);
  }, [stats, updateUnreadCount]);

  const handleStatusUpdate = (notificationId, status) => {
    dispatch(updateNotificationStatus({ notificationId, status }))
      .unwrap()
      .then(() => {
        dispatch(
          fetchNotifications({ page: currentPage, limit: 20, ...filter })
        );
        dispatch(fetchStats());
      });
  };

  const handleBatchUpdate = (status) => {
    if (selectedNotifications.length === 0) return;

    dispatch(
      batchUpdateNotifications({
        notificationIds: selectedNotifications,
        status,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(
          fetchNotifications({ page: currentPage, limit: 20, ...filter })
        );
        dispatch(fetchStats());
      });
  };

  const handleDelete = (notificationId) => {
    dispatch(deleteNotification(notificationId))
      .unwrap()
      .then(() => {
        dispatch(
          fetchNotifications({ page: currentPage, limit: 20, ...filter })
        );
        dispatch(fetchStats());
      });
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ [key]: value }));
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handleSelectNotification = (notificationId, checked) => {
    if (checked) {
      dispatch(
        setSelectedNotifications([...selectedNotifications, notificationId])
      );
    } else {
      dispatch(
        setSelectedNotifications(
          selectedNotifications.filter((id) => id !== notificationId)
        )
      );
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (notification.status === "unread") {
      dispatch(
        updateNotificationStatus({
          notificationId: notification._id,
          status: "read",
        })
      )
        .unwrap()
        .then(() => {
          dispatch(
            fetchNotifications({ page: currentPage, limit: 20, ...filter })
          );
          dispatch(fetchStats());
        });
    }

    // Navigate to action URL if exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "plan_update":
        return <FiBell className="w-5 h-5" />;
      case "message":
        return <FiMessageSquare className="w-5 h-5" />;
      default:
        return <FiBell className="w-5 h-5" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and track all your notifications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.statusStats.map((stat) => (
            <div
              key={stat._id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat._id === "unread" ? "Unread" : "Read"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.count}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FiBell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filter.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={filter.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="plan_update">Plan Updates</option>
                  <option value="message">Messages</option>
                </select>

                <select
                  value={filter.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {selectedNotifications.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBatchUpdate("read")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FiCheck className="w-4 h-4" />
                    Mark as Read
                  </button>
                  <button
                    onClick={() => handleBatchUpdate("archived")}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <FiArchive className="w-4 h-4" />
                    Archive
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <FiBell className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-600">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    notification.status === "unread" ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(
                          notification._id
                        )}
                        onChange={(e) =>
                          handleSelectNotification(
                            notification._id,
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${
                              notification.status === "unread"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {notification.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${getPriorityColor(
                              notification.priority
                            )}`}
                          >
                            {notification.priority === "urgent"
                              ? "Urgent"
                              : notification.priority === "high"
                              ? "High"
                              : notification.priority === "medium"
                              ? "Medium"
                              : "Low"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(notification.createdAt), "PPp")}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-gray-600">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex items-center gap-4">
                        {notification.status === "unread" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(notification._id, "read");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <FiCheck className="w-4 h-4" />
                            Mark as Read
                          </button>
                        )}
                        {notification.status !== "archived" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(notification._id, "archived");
                            }}
                            className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
                          >
                            <FiArchive className="w-4 h-4" />
                            Archive
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      handlePageChange(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page{" "}
                      <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          handlePageChange(Math.max(currentPage - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(currentPage + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
