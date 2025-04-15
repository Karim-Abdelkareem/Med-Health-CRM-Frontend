import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
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
