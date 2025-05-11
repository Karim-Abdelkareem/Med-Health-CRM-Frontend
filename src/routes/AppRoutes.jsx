import React from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/auth/AuthLayout";
import Login from "../pages/auth/Login";
import MainLayout from "../layouts/main/MainLayout";
import Dashboard from "../pages/Dashboard";
import CreatePlan from "../pages/Plan/CreatePlan";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleBasedRoute from "../components/RoleBasedRoute";
import MyPlans from "../pages/Plan/MyPlans";
import UsersPlan from "../pages/UsersPlan/UsersPlan";
import Location from "../pages/Location/Loaction";
import CreateUser from "../pages/CreateUser/CreateUser";
import Profile from "../pages/Profile/Profile";
import History from "../pages/History/History";
import LocationDetails from "../pages/LocationDetails/LocationDetails";
import Notifications from "../pages/Notifications/Notifications";
import UsersList from "../pages/UsersList/UsersList";
import UserEdit from "../pages/UserEdit/UserEdit";
import PlanDetail from "../pages/PlanDetail/PlanDetail";
import EditPlan from "../pages/EditPlan/EditPlan";
import HolidayRequest from "../pages/HolidayRequest/HolidayRequest";
import HolidayDetails from "../pages/HolidayDetails/HolidayDetails";
import UserDetail from "../pages/UserDetails/UserDetail";
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
        <Route
          path="/users-plans"
          element={
            <RoleBasedRoute allowedRoles={["HR", "GM", "DM", "LM", "Area"]}>
              <UsersPlan />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/plan-detail/:id"
          element={
            <RoleBasedRoute allowedRoles={["GM", "HR", "LM", "Area", "DM"]}>
              <PlanDetail />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/plan/edit/:id"
          element={
            <RoleBasedRoute allowedRoles={["GM", "HR"]}>
              <EditPlan />
            </RoleBasedRoute>
          }
        />
        <Route
          path="add-location"
          element={
            <RoleBasedRoute allowedRoles={["HR", "DM", "GM"]}>
              <Location />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/add-user"
          element={
            <RoleBasedRoute allowedRoles={["HR", "GM"]}>
              <CreateUser />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleBasedRoute allowedRoles={["HR", "GM"]}>
              <UsersList />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/edit-user/:id"
          element={
            <RoleBasedRoute allowedRoles={["HR", "GM"]}>
              <UserEdit />
            </RoleBasedRoute>
          }
        />

        <Route path="/profile" element={<Profile />} />
        <Route
          path="/history"
          element={
            <RoleBasedRoute allowedRoles={["R"]}>
              <History />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/location-details/:planId/:locationId"
          element={
            <RoleBasedRoute allowedRoles={["R"]}>
              <LocationDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <RoleBasedRoute
              allowedRoles={["R", "HR", "LM", "DM", "GM", "Area"]}
            >
              <Notifications />
            </RoleBasedRoute>
          }
        />
        <Route path="/request-holiday" element={<HolidayRequest />} />
        <Route path="/holiday-details/:id" element={<HolidayDetails />} />
        <Route path="/user/:id" element={<UserDetail />} />
      </Route>
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
