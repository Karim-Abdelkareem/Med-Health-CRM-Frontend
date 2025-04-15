import React from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/auth/AuthLayout";
import Login from "../pages/auth/Login";
import MainLayout from "../layouts/main/MainLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<div>Home</div>} />
      </Route>
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
