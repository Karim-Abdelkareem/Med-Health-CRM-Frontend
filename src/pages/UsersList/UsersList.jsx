import React, { useEffect, useState } from "react";
import userService from "../../store/User/UserService";
import { FiEdit, FiUserX, FiUserCheck } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllEmployee();
      setUsers(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (userId) => {
    navigate(`/edit-user/${userId}`);
  };

  const handleDeactivateClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeactivate = async (userId) => {
    try {
      await userService.deactivateUser(userId);
      toast.success("User status updated successfully");
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error("Failed to update user status");
      console.error(error);
    }
  };

  // Apply both search and status filters
  const filteredUsers = users.filter(
    (user) => {
      // Apply search filter
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && user.active) || 
        (statusFilter === "inactive" && !user.active);
      
      return matchesSearch && matchesStatus;
    }
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "HR":
        return "bg-purple-100 text-purple-800";
      case "DM":
        return "bg-blue-100 text-blue-800";
      case "LM":
        return "bg-green-100 text-green-800";
      case "R":
        return "bg-yellow-100 text-yellow-800";
      case "Area":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <button
          onClick={() => navigate("/add-user")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-150 ease-in-out"
        >
          Add New User
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-64">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit User"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeactivateClick(user)}
                          className={
                            user.active
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }
                          title={
                            user.active ? "Deactivate User" : "Activate User"
                          }
                        >
                          {user.active ? (
                            <FiUserX size={18} />
                          ) : (
                            <FiUserCheck size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by adding a new user."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedUser.active
                ? "Confirm Deactivation"
                : "Confirm Activation"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to{" "}
              {selectedUser.active ? "deactivate" : "activate"}{" "}
              {selectedUser.name}?
              {selectedUser.active && " This action can be reversed later."}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeactivate(selectedUser._id);
                  setShowDeleteModal(false);
                }}
                className={`px-4 py-2 ${
                  selectedUser.active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white rounded-md`}
              >
                {selectedUser.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
