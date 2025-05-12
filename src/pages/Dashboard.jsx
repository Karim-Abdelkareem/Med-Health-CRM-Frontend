import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Calendar,
  UserCircle,
  TrendingUp,
  MapPin,
  UserCheck,
  Filter,
  CheckCircle,
} from "lucide-react";
import Chart from "react-apexcharts";
import axios from "axios";
import { base_url } from "../constants/axiosConfig";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("All");
  const [viewMode, setViewMode] = useState("overview"); // overview, users

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${base_url}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading || !dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Get current user data
  const currentUser = dashboardData.currentUser;

  // Filter users based on role if needed and exclude GM and HR
  const filteredUsers = dashboardData.allUsers
    .filter((user) => user.user.role !== "GM" && user.user.role !== "HR")
    .filter((user) => filterRole === "All" || user.user.role === filterRole);

  // Navigation tabs
  const renderNavTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        className={`px-4 py-2 font-medium text-sm ${
          viewMode === "overview"
            ? "text-indigo-600 border-b-2 border-indigo-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setViewMode("overview")}
      >
        Overview
      </button>
      <button
        className={`px-4 py-2 font-medium text-sm ${
          viewMode === "users"
            ? "text-indigo-600 border-b-2 border-indigo-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setViewMode("users")}
      >
        Users
      </button>
    </div>
  );

  // Prepare system-wide KPI chart data
  const systemKpiChartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 5,
    },
    xaxis: {
      categories:
        dashboardData.allEmployeesMonthlyKPI?.map((item) => item.month) || [],
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
        formatter: (value) => `${value}%`,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#4F46E5", "#94A3B8"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    markers: { size: 4 },
    tooltip: {
      theme: "light",
      y: { formatter: (value) => `${value}%` },
    },
    legend: { position: "top", horizontalAlign: "right" },
  };

  const systemKpiChartSeries = [
    {
      name: "Average Achievement",
      data:
        dashboardData.allEmployeesMonthlyKPI?.map(
          (item) => item.averageAchieved
        ) || [],
    },
    {
      name: "Target",
      data:
        dashboardData.allEmployeesMonthlyKPI?.map((item) => item.target) || [],
      strokeDashArray: 4,
    },
  ];

  // Prepare user-specific KPI chart data if a user is selected
  const getUserKpiChartSeries = (userData) => [
    {
      name: "Achievement",
      data: userData.monthlyKPI.map((item) => item.achieved),
    },
    {
      name: "Target",
      data: userData.monthlyKPI.map((item) => item.target),
      strokeDashArray: 4,
    },
  ];

  // Prepare donut chart for system-wide completion
  const systemDonutOptions = {
    labels: ["Completed", "Remaining"],
    colors: ["#10B981", "#E5E7EB"],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: { show: true, total: { show: true, label: "Total Visits" } },
        },
      },
    },
  };

  const completedVisits = dashboardData.systemStats.plans?.completedVisits || 0;
  const totalVisits = dashboardData.systemStats.plans?.totalVisits || 0;

  const systemDonutSeries = [completedVisits, totalVisits - completedVisits];

  // Prepare role distribution data
  const roleDistributionLabels = dashboardData.systemStats.users.byRole
    ? Object.keys(dashboardData.systemStats.users.byRole).map((role) => {
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
            return role;
        }
      })
    : [];

  const roleDistributionValues = dashboardData.systemStats.users.byRole
    ? Object.values(dashboardData.systemStats.users.byRole)
    : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {currentUser.name}! Here's your performance summary.
          </p>
        </div>

        {renderNavTabs()}

        {viewMode === "overview" && (
          <>
            {/* System Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Completion Rate"
                value={`${
                  dashboardData.systemStats.plans?.completionRate || 0
                }%`}
                icon={<CheckCircle className="text-indigo-600" />}
                change={
                  (dashboardData.systemStats.plans?.completionRate || 0) >= 85
                    ? "On Target"
                    : "Below Target"
                }
                trend={
                  (dashboardData.systemStats.plans?.completionRate || 0) >= 85
                    ? "up"
                    : "down"
                }
              />
              <StatsCard
                title="Active Users"
                value={dashboardData.systemStats.users?.active || 0}
                icon={<UserCheck className="text-emerald-600" />}
                change="Total"
                trend="neutral"
              />
              <StatsCard
                title="Total Plans"
                value={dashboardData.systemStats.plans?.total || 0}
                icon={<Calendar className="text-amber-600" />}
                change="This Month"
                trend="neutral"
              />
              <StatsCard
                title="Total Locations"
                value={dashboardData.systemStats.locations?.total || 0}
                icon={<MapPin className="text-purple-600" />}
                change="All Users"
                trend="neutral"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* System KPI Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      System Performance
                    </h2>
                    <p className="text-sm text-gray-500">
                      Monthly average achievement vs targets
                    </p>
                  </div>
                </div>
                <div className="h-80">
                  <Chart
                    options={systemKpiChartOptions}
                    series={systemKpiChartSeries}
                    type="area"
                    height="100%"
                    width="100%"
                  />
                </div>
              </div>

              {/* Role Distribution Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      User Role Distribution
                    </h2>
                    <p className="text-sm text-gray-500">Users by role</p>
                  </div>
                </div>
                <div className="h-80">
                  <Chart
                    options={{
                      labels: roleDistributionLabels,
                      colors: [
                        "#4F46E5",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                        "#EC4899",
                      ],
                      legend: { position: "bottom" },
                      dataLabels: { enabled: false },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: "70%",
                          },
                        },
                      },
                    }}
                    series={roleDistributionValues}
                    type="donut"
                    height="100%"
                  />
                </div>
              </div>
            </div>

            {/* Role-specific sections */}
            {currentUser.role === "GM" && dashboardData.gmStats && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      GM Dashboard
                    </h2>
                    <p className="text-sm text-gray-500">
                      Performance overview for General Manager
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">
                      Top Performers
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                              Name
                            </th>
                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                              Role
                            </th>
                            <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                              KPI %
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.gmStats.topPerformers.map((user) => (
                            <tr
                              key={user._id}
                              className="border-b border-gray-100"
                            >
                              <td className="py-2 px-4 text-sm font-medium text-gray-900">
                                {user.name}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700">
                                {user.role}
                              </td>
                              <td className="text-right py-2 px-4 text-sm text-gray-700">
                                {user.kpi}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">
                      Underperforming Employees
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                              Name
                            </th>
                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                              Role
                            </th>
                            <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                              KPI %
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.gmStats.underperformers.map((user) => (
                            <tr
                              key={user._id}
                              className="border-b border-gray-100"
                            >
                              <td className="py-2 px-4 text-sm font-medium text-gray-900">
                                {user.name}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-700">
                                {user.role}
                              </td>
                              <td className="text-right py-2 px-4 text-sm text-gray-700">
                                {user.kpi}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentUser.role === "HR" && dashboardData.hrStats && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      HR Dashboard
                    </h2>
                    <p className="text-sm text-gray-500">
                      Holiday and employee statistics
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-900 mb-3">
                      Holiday Statistics
                    </h3>
                    <div className="space-y-3">
                      <StatusRow
                        color="#10B981"
                        label="Total Holidays Taken"
                        count={dashboardData.hrStats.holidays.totalTaken}
                      />
                      <StatusRow
                        color="#4F46E5"
                        label="Total Holidays Remaining"
                        count={dashboardData.hrStats.holidays.totalRemaining}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-900 mb-3">
                      Top Holiday Users
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">
                              Name
                            </th>
                            <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">
                              Days Taken
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.hrStats.holidays.topUsers.map(
                            (user) => (
                              <tr
                                key={user._id}
                                className="border-b border-gray-100"
                              >
                                <td className="py-2 px-4 text-sm font-medium text-gray-900">
                                  {user.name}
                                </td>
                                <td className="text-right py-2 px-4 text-sm text-gray-700">
                                  {user.holidaysTaken}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === "users" && (
          <>
            {/* Filter Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <Filter size={16} className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Filter by:
                </span>
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="R">Representatives</option>
                <option value="LM">Line Managers</option>
                <option value="DM">District Managers</option>
                <option value="Area">Area Managers</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Team Performance
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filterRole === "All" ? "All users" : `${filterRole} users`}{" "}
                    performance metrics
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Role
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        KPI %
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Active Plans
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Locations
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userData) => {
                      const user = userData.user;
                      return (
                        <tr
                          key={user._id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(userData)}
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {(() => {
                              switch (user.role) {
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
                                  return user.role;
                              }
                            })()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-gray-700">
                            {userData.kpiData.completionPercentage}%
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-gray-700">
                            {userData.planData.activePlans}
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-gray-700">
                            {userData.planData.locationsCount}
                          </td>
                          <td className="text-right py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                userData.kpiData.completionPercentage >= 85
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {userData.kpiData.completionPercentage >= 85
                                ? "On Target"
                                : "Below Target"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected User Details */}
            {selectedUser && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-full">
                      <UserCircle size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedUser.user.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {(() => {
                          switch (selectedUser.user.role) {
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
                              return selectedUser.user.role;
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setSelectedUser(null)}
                  >
                    <ChevronDown size={16} className="!-rotate-90" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      KPI Performance
                    </h3>
                    <div className="h-64">
                      <Chart
                        options={{
                          chart: {
                            type: "area",
                            toolbar: { show: false },
                            zoom: { enabled: false },
                            fontFamily: "Inter, sans-serif",
                          },
                          grid: {
                            borderColor: "#E2E8F0",
                            strokeDashArray: 5,
                          },
                          xaxis: {
                            categories: selectedUser.monthlyKPI.map(
                              (item) => item.month
                            ),
                            labels: {
                              style: {
                                colors: "#64748B",
                                fontSize: "12px",
                              },
                            },
                          },
                          yaxis: {
                            labels: {
                              style: {
                                colors: "#64748B",
                                fontSize: "12px",
                              },
                              formatter: (value) => `${value}%`,
                            },
                          },
                          stroke: {
                            curve: "smooth",
                            width: 3,
                            colors: ["#4F46E5", "#94A3B8"],
                          },
                          fill: {
                            type: "gradient",
                            gradient: {
                              shadeIntensity: 1,
                              opacityFrom: 0.4,
                              opacityTo: 0.1,
                              stops: [0, 90, 100],
                            },
                          },
                          dataLabels: { enabled: false },
                          markers: { size: 4 },
                          tooltip: {
                            theme: "light",
                            y: { formatter: (value) => `${value}%` },
                          },
                          legend: { position: "top", horizontalAlign: "right" },
                        }}
                        series={getUserKpiChartSeries(selectedUser)}
                        type="area"
                        height="100%"
                        width="100%"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Performance Summary
                    </h3>
                    <div className="space-y-4">
                      <StatusRow
                        color="#10B981"
                        label="Completed Visits"
                        count={selectedUser.kpiData.completedVisits}
                        percentage={(
                          (selectedUser.kpiData.completedVisits /
                            Math.max(selectedUser.kpiData.totalVisits, 1)) *
                          100
                        ).toFixed(1)}
                      />
                      <StatusRow
                        color="#E5E7EB"
                        label="Remaining Visits"
                        count={
                          selectedUser.kpiData.totalVisits -
                          selectedUser.kpiData.completedVisits
                        }
                        percentage={(
                          ((selectedUser.kpiData.totalVisits -
                            selectedUser.kpiData.completedVisits) /
                            Math.max(selectedUser.kpiData.totalVisits, 1)) *
                          100
                        ).toFixed(1)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === "performance" && (
          <>
            {/* System-wide Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    System-wide Performance
                  </h2>
                  <p className="text-sm text-gray-500">
                    Overview of system-wide performance metrics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    KPI Performance
                  </h3>
                  <div className="h-64">
                    <Chart
                      options={systemKpiChartOptions}
                      series={systemKpiChartSeries}
                      type="area"
                      height="100%"
                      width="100%"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Completion Status
                  </h3>
                  <div className="h-64">
                    <Chart
                      options={systemDonutOptions}
                      series={systemDonutSeries}
                      type="donut"
                      height="100%"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Role Distribution
                  </h3>
                  <div className="h-64">
                    <Chart
                      options={{
                        labels: Object.keys(
                          dashboardData.systemStats.roleDistribution
                        ),
                        colors: [
                          "#4F46E5",
                          "#10B981",
                          "#F59E0B",
                          "#EF4444",
                          "#8B5CF6",
                          "#EC4899",
                        ],
                        legend: { position: "bottom" },
                        dataLabels: { enabled: false },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: "70%",
                            },
                          },
                        },
                      }}
                      series={Object.values(
                        dashboardData.systemStats.roleDistribution
                      )}
                      type="donut"
                      height="100%"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* User Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    User Performance Metrics
                  </h2>
                  <p className="text-sm text-gray-500">
                    Performance metrics for all users
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Role
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        KPI %
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Active Plans
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Locations
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userData) => {
                      const user = userData.user;
                      return (
                        <tr
                          key={user._id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(userData)}
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {(() => {
                              switch (user.role) {
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
                                  return user.role;
                              }
                            })()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-gray-700">
                            {userData.kpiData.completionPercentage}%
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-gray-700">
                            {userData.planData.activePlans}
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-gray-700">
                            {userData.planData.locationsCount}
                          </td>
                          <td className="text-right py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                userData.kpiData.completionPercentage >= 85
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {userData.kpiData.completionPercentage >= 85
                                ? "On Target"
                                : "Below Target"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const StatsCard = ({ title, value, icon, change, trend }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      {trend === "up" && (
        <div className="flex items-center text-xs font-medium text-emerald-600">
          <TrendingUp size={14} className="mr-1" />
          {change}
        </div>
      )}
      {trend === "down" && (
        <div className="flex items-center text-xs font-medium text-red-600">
          <TrendingUp size={14} className="mr-1 transform rotate-180" />
          {change}
        </div>
      )}
      {trend === "neutral" && (
        <div className="text-xs font-medium text-gray-500">{change}</div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900">
      {value.toLocaleString ? value.toLocaleString() : value}
    </h3>
    <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
  </div>
);

const StatusRow = ({ color, label, count, percentage }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">{count}</span>
      <span className="text-sm font-medium" style={{ color }}>
        {percentage}%
      </span>
    </div>
  </div>
);
