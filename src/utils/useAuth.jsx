// src/layouts/AuthLayout.jsx
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/"); // Redirect authenticated users away from login/register
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="mb-6">
          <img
            src="https://med-health.org/user/images/logo-main.png"
            alt="Med-Health Logo"
            className="invert"
          />
        </div>
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
          <Outlet />
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm my-4">
        © {new Date().getFullYear()} Med-Health. All rights reserved.
      </div>
    </>
  );
}
