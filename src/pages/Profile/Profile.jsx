import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import { base_url } from "../../constants/axiosConfig";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FiUser, FiMail, FiUsers, FiMap, FiLock } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileChanged, setProfileChanged] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Separate form instances for profile and password
  const profileForm = useForm();
  const passwordForm = useForm();

  // Watch profile form values
  const profileValues = profileForm.watch();

  // Watch password form values
  const passwordValues = passwordForm.watch();

  const formatRole = (role) => {
    switch (role) {
      case "R":
        return "Representative";
      case "DM":
        return "District Manager";
      case "LM":
        return "Line Manager";
      case "Area":
        return "Area Sales Manager";
      case "HR":
        return "HR";
      case "GM":
        return "General Manager";
      default:
        return "Guest";
    }
  };

  // Check if profile form has changed
  useEffect(() => {
    if (originalData && profileValues) {
      const hasNameChanged = originalData.name !== profileValues.name;
      const hasEmailChanged = originalData.email !== profileValues.email;

      setProfileChanged(hasNameChanged || hasEmailChanged);
    }
  }, [profileValues, originalData]);

  // Check if password form has changed
  useEffect(() => {
    if (passwordValues) {
      const hasPasswordChanged =
        passwordValues.currentPassword &&
        passwordValues.currentPassword.trim() !== "" &&
        passwordValues.newPassword &&
        passwordValues.newPassword.trim() !== "";

      setPasswordChanged(hasPasswordChanged);
    }
  }, [passwordValues]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.data);

      setProfileData(response.data.data);
      setOriginalData(response.data.data);
      profileForm.reset(response.data.data);
    } catch {
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");

      // Only send fields that have changed
      const updatedData = {};
      if (data.name !== originalData.name) updatedData.name = data.name;
      if (data.email !== originalData.email) updatedData.email = data.email;

      const response = await axios.patch(
        `${base_url}/api/user/profile`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update user context with new data
      if (response.data && response.data.data) {
        updateUser({
          name: data.name,
          email: data.email,
        });
      }

      toast.success("Profile updated successfully");
      fetchProfileData();
      setProfileChanged(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (data) => {
    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");

      const passwordData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      await axios.patch(`${base_url}/api/user/change-password`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Password changed successfully");

      // Reset password fields
      passwordForm.reset();
      setPasswordChanged(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 mt-1">
            Update your personal information and password
          </p>
        </div>

        {/* Personal Information Form */}
        <form
          onSubmit={profileForm.handleSubmit(updateProfile)}
          className="mt-6"
        >
          <div className="space-y-12">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Only show name field if it exists in profile data */}
                {profileData?.name !== undefined && (
                  <div>
                    <label className="flex items-center text-gray-700 font-medium mb-2">
                      <FiUser className="mr-2" />
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      {...profileForm.register("name", {
                        required: "Name is required",
                      })}
                      className={`w-full px-4 py-3 border-b-2 ${
                        profileForm.formState.errors.name
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:border-blue-500 focus:outline-none transition-colors bg-gray-50`}
                      placeholder="Enter your full name"
                    />
                    {profileForm.formState.errors.name && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {profileForm.formState.errors.name.message}
                      </span>
                    )}
                  </div>
                )}

                {/* Only show email field if it exists in profile data */}
                {profileData?.email !== undefined && (
                  <div>
                    <label className="flex items-center text-gray-700 font-medium mb-2">
                      <FiMail className="mr-2" />
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      {...profileForm.register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={`w-full px-4 py-3 border-b-2 ${
                        profileForm.formState.errors.email
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:border-blue-500 focus:outline-none transition-colors bg-gray-50`}
                      placeholder="Enter your email address"
                    />
                    {profileForm.formState.errors.email && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {profileForm.formState.errors.email.message}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Account Information Section - Only show if role or governate exists */}
            {(user?.role !== undefined ||
              profileData?.governate !== undefined) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-6">
                  Account Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Only show role field if it exists */}
                  {user?.role !== undefined && (
                    <div>
                      <label className="flex items-center text-gray-700 font-medium mb-2">
                        <FiUsers className="mr-2" />
                        Role
                      </label>
                      <input
                        type="text"
                        value={formatRole(user?.role) || ""}
                        disabled
                        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none bg-gray-100 text-gray-600"
                      />
                    </div>
                  )}

                  {/* Only show governate field if it exists */}
                  {profileData?.governate !== undefined && (
                    <div>
                      <label className="flex items-center text-gray-700 font-medium mb-2">
                        <FiMap className="mr-2" />
                        Governate
                      </label>
                      <input
                        disabled
                        type="text"
                        {...profileForm.register("governate")}
                        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none bg-gray-100 text-gray-600"
                      />
                    </div>
                  )}
                  {/* Add more fields as needed */}
                  {profileData?.Area !== undefined && (
                    <div>
                      <label className="flex items-center text-gray-700 font-medium mb-2">
                        <FiUsers className="mr-2" />
                        Area Manager
                      </label>
                      <input
                        disabled
                        type="text"
                        value={profileData?.Area.name || ""}
                        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none bg-gray-100 text-gray-600"
                      />
                    </div>
                  )}
                  {profileData?.LM !== undefined && (
                    <div>
                      <label className="flex items-center text-gray-700 font-medium mb-2">
                        <FiUsers className="mr-2" />
                        Line Manager
                      </label>
                      <input
                        disabled
                        type="text"
                        value={profileData?.LM.name || ""}
                        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none bg-gray-100 text-gray-600"
                      />
                    </div>
                  )}
                  {profileData?.DM !== undefined && (
                    <div>
                      <label className="flex items-center text-gray-700 font-medium mb-2">
                        <FiUsers className="mr-2" />
                        District Manager
                      </label>
                      <input
                        disabled
                        type="text"
                        value={profileData?.DM.name || ""}
                        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none bg-gray-100 text-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Submit Button */}
          <div className="mt-10 flex justify-end">
            <button
              type="submit"
              disabled={profileLoading || !profileChanged}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                profileLoading || !profileChanged
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {profileLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </form>

        {/* Password Change Form */}
        <form
          onSubmit={passwordForm.handleSubmit(changePassword)}
          className="mt-16"
        >
          <div className="space-y-12">
            {/* Password Change Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Change Password
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FiLock className="mr-2" />
                    Current Password{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register("currentPassword", {
                      required:
                        "Current password is required to change password",
                    })}
                    className={`w-full px-4 py-3 border-b-2 ${
                      passwordForm.formState.errors.currentPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:border-blue-500 focus:outline-none transition-colors bg-gray-50`}
                    placeholder="Enter current password"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {passwordForm.formState.errors.currentPassword.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-gray-700 font-medium mb-2">
                    <FiLock className="mr-2" />
                    New Password <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className={`w-full px-4 py-3 border-b-2 ${
                      passwordForm.formState.errors.newPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:border-blue-500 focus:outline-none transition-colors bg-gray-50`}
                    placeholder="Enter new password"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {passwordForm.formState.errors.newPassword.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Password Submit Button */}
          <div className="mt-10 flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading || !passwordChanged}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                passwordLoading || !passwordChanged
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {passwordLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Changing...
                </span>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
