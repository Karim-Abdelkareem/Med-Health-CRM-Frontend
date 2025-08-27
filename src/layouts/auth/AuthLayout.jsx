import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../utils/useAuth"; // assuming you have this hook

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // If the user is already authenticated, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redirect to the home page (or wherever you'd like)
    }
  }, [isAuthenticated, navigate]);

  // If the authentication status is still loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="relative flex justify-center items-center p-4 shadow-md">
        <img
          src="https://med-health.org/user/images/logo-main.png"
          alt="Med-Health Logo"
          className="invert"
        />
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex">
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Right Side - Logo */}
        <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-50">
          <div className="text-center justify-center items-center">
            <img
              src="https://med-health.org/user/images/logo-main.png"
              alt="Med-Health Logo"
              className="w-full h-auto mb-8 invert"
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Med-Health
            </h1>
            <p className="text-gray-600 text-lg">
              Advanced Healthcare Customer Management System
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm p-4">
        © {new Date().getFullYear()} Med-Health. All rights reserved.
      </div>
    </div>
  );
}
