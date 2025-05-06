import React from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/auth/AuthLayout";
import Login from "../pages/auth/Login";
import MainLayout from "../layouts/main/MainLayout";
import Dashboard from "../pages/Dashboard";
import CreatePlan from "../pages/Plan/CreatePlan";
import ProtectedRoute from "../components/ProtectedRoute";
import MyPlans from "../pages/Plan/MyPlans";
import UsersPlan from "../pages/UsersPlan/UsersPlan";
import Location from "../pages/Location/Loaction";
import CreateUser from "../pages/CreateUser/CreateUser";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-plans" element={<CreatePlan />} />
        <Route path="/my-plans" element={<MyPlans />} />
        <Route path="/users-plans" element={<UsersPlan />} />
        <Route path="add-location" element={<Location />} />
        <Route path="/add-user" element={<CreateUser />} />
      </Route>
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
