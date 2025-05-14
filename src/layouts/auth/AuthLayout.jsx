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
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="mb-6">
          <div className="relative">
            <img
              src="https://med-health.org/user/images/logo-main.png"
              alt="Med-Health Logo"
              className="invert"
            />
          </div>
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
