import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiPhone,
  FiTarget,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import userService from "../../store/User/UserService";
import holidayService from "../../store/Holidays/HolidaysService";
import planService from "../../store/Plan/planyService";
import axios from "axios";
import { base_url } from "../../constants/axiosConfig";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [plans, setPlans] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentNotesPage, setCurrentNotesPage] = useState(1);
  const [currentPlansPage, setCurrentPlansPage] = useState(1);
  const itemsPerPage = 12;

  // Pagination helpers
  const paginate = (items, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = (items) => Math.ceil(items.length / itemsPerPage);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Fetch user details
        const userResponse = await userService.getUserById(id);
        setUser(userResponse.data);

        // Fetch user holidays
        const holidaysResponse = await holidayService.getUserHolidays(id);
        setHolidays(holidaysResponse.data.data || []);

        // Fetch user plans
        const plansResponse = await planService.getUserPlans(id);

        setPlans(plansResponse.data || []);

        // Fetch user KPIs
        const kpisResponse = await axios.get(
          `${base_url}/api/users/monthly-kpi-stats/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setKpis(kpisResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  // Format role for display
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

  // Calculate holiday statistics
  const holidayStats = {
    total: 27,
    taken: holidays
      .filter((h) => h.status === "approved")
      .reduce((sum, h) => sum + h.days, 0),
    pending: holidays
      .filter((h) => h.status === "pending")
      .reduce((sum, h) => sum + h.days, 0),
  };
  holidayStats.remaining = holidayStats.total - holidayStats.taken;

  // Prepare chart data
  const holidayChartData = {
    labels: ["Taken", "Remaining"],
    datasets: [
      {
        data: [holidayStats.taken, holidayStats.remaining],
        backgroundColor: ["#4F46E5", "#E5E7EB"],
        borderWidth: 0,
      },
    ],
  };

  const kpiChartData = {
    labels: kpis.map((kpi) => kpi.month),
    datasets: [
      {
        label: "Target",
        data: kpis.map((kpi) => kpi.target),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: "Achieved",
        data: kpis.map((kpi) => kpi.achieved),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  // Calculate plan statistics based on location completion status
  const calculatePlanStats = (plans) => {
    // Initialize counters
    let completedPlans = 0;
    let inProgressPlans = 0;
    let plannedPlans = plans.length;

    // Analyze each plan
    plans.forEach((plan) => {
      // Count completed locations in this plan
      const totalLocations = plan.locations.length;
      const completedLocations = plan.locations.filter(
        (loc) => loc.status === "completed"
      ).length;

      // If all locations are completed, count as completed plan
      if (completedLocations === totalLocations && totalLocations > 0) {
        completedPlans++;
        plannedPlans--;
      }
      // If some locations are completed but not all, count as in-progress
      else if (completedLocations > 0) {
        inProgressPlans++;
        plannedPlans--;
      }
    });

    return {
      completed: completedPlans,
      inProgress: inProgressPlans,
      planned: plannedPlans,
    };
  };

  const planStats = calculatePlanStats(plans);

  const planCompletionData = {
    labels: ["Completed", "In Completed", "Planned"],
    datasets: [
      {
        label: "Plans",
        data: [planStats.completed, planStats.inProgress, planStats.planned],
        backgroundColor: ["#10B981", "#FF0000", "#4F46E5"],
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User Not Found</h2>
          <p className="mt-2 text-gray-600">
            The user you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  //   // Pagination functions
  //   const paginate = (array, page, pageSize = 12) => {
  //     return array.slice((page - 1) * pageSize, page * pageSize);
  //   };

  //   const getTotalPages = (array, pageSize = 12) => {
  //     return Math.ceil(array.length / pageSize);
  //   };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            User Profile
          </h1>
        </div>

        {/* User Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <FiUser size={36} />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-600">{formatRole(user.role)}</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-600">
                    <FiMail className="mr-2" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="mr-2" />
                    {user.governate || "Location not specified"}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-2" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => navigate(`/edit-user/${id}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "overview"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("kpi")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "kpi"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                KPI
              </button>
              <button
                onClick={() => setActiveTab("holidays")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "holidays"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Holidays
              </button>
              <button
                onClick={() => setActiveTab("plans")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "plans"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Plans
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "notes"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Notes
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiTarget className="mr-2 text-blue-500" /> Performance
                  </h3>
                  {/* Get current month KPI */}
                  {(() => {
                    const currentMonth = new Date().toLocaleString("default", {
                      month: "short",
                    });
                    const currentMonthKpi = kpis.find(
                      (kpi) => kpi.month === currentMonth
                    );

                    if (currentMonthKpi) {
                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-600">
                              Current Month ({currentMonthKpi.month})
                            </span>
                            <span className="text-lg font-semibold">
                              {currentMonthKpi.achieved}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-600">Target</span>
                            <span className="text-lg font-semibold">
                              {currentMonthKpi.target}%
                            </span>
                          </div>
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{
                                  width: `${currentMonthKpi.achieved}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="mt-4 text-center">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                currentMonthKpi.achieved >=
                                currentMonthKpi.target
                                  ? "bg-green-100 text-green-800"
                                  : currentMonthKpi.achieved >=
                                    currentMonthKpi.target * 0.9
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {currentMonthKpi.achieved >=
                              currentMonthKpi.target
                                ? "Exceeded"
                                : currentMonthKpi.achieved >=
                                  currentMonthKpi.target * 0.9
                                ? "Near Target"
                                : "Below Target"}
                            </span>
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          No KPI data available for current month.
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Holiday Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiCalendar className="mr-2 text-blue-500" /> Holiday
                    Allowance
                  </h3>
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32">
                      <Doughnut
                        data={holidayChartData}
                        options={{
                          cutout: "70%",
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Taken</p>
                      <p className="text-xl font-semibold">
                        {holidayStats.taken}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Remaining</p>
                      <p className="text-xl font-semibold">
                        {holidayStats.remaining}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plans Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiClock className="mr-2 text-blue-500" /> Plans Status
                  </h3>
                  <div className="flex justify-center mb-4">
                    <div className="w-full h-40">
                      <Bar
                        data={planCompletionData}
                        options={{
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-gray-500 text-sm">Total Plans</p>
                    <p className="text-xl font-semibold">{plans.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Tab */}
            {activeTab === "kpi" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Performance Metrics
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <div className="h-80">
                    <Line
                      data={kpiChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Monthly KPI Performance",
                          },
                        },
                        scales: {
                          y: {
                            min: 50,
                            max: 100,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Month
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Target
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Achieved
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {kpis.map((kpi, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {kpi.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {kpi.target}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {kpi.achieved}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                kpi.achieved >= kpi.target
                                  ? "bg-green-100 text-green-800"
                                  : kpi.achieved >= kpi.target * 0.9
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {kpi.achieved >= kpi.target
                                ? "Exceeded"
                                : kpi.achieved >= kpi.target * 0.9
                                ? "Near Target"
                                : "Below Target"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Holidays Tab */}
            {activeTab === "holidays" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Holiday Requests
                  </h3>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approved:{" "}
                      {holidays.filter((h) => h.status === "approved").length}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending:{" "}
                      {holidays.filter((h) => h.status === "pending").length}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Rejected:{" "}
                      {holidays.filter((h) => h.status === "rejected").length}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32">
                      <Doughnut
                        data={holidayChartData}
                        options={{
                          cutout: "70%",
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Taken</p>
                      <p className="text-xl font-semibold">
                        {holidayStats.taken}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Remaining</p>
                      <p className="text-xl font-semibold">
                        {holidayStats.remaining}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Start Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          End Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Days
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {holidays.map((holiday, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {format(new Date(holiday.startDate), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {format(new Date(holiday.endDate), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 capitalize inline-flex text-xs leading-5 font-semibold rounded-full ${
                                holiday.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : holiday.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {holiday.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {holiday.days}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === "plans" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Visit Plans
                  </h3>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed: {planStats.completed}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      In Completed: {planStats.inProgress}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Planned: {planStats.planned}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <div className="h-80">
                    <Bar
                      data={planCompletionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: "Plan Completion Status",
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Visit Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Locations
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Completion
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginate(plans, currentPlansPage).map((plan) => {
                        const totalLocations = plan.locations.length;
                        const completedLocations = plan.locations.filter(
                          (loc) => loc.status === "completed"
                        ).length;
                        const completionPercentage =
                          totalLocations > 0
                            ? Math.round(
                                (completedLocations / totalLocations) * 100
                              )
                            : 0;

                        let status = "Planned";
                        if (
                          completedLocations === totalLocations &&
                          totalLocations > 0
                        ) {
                          status = "Completed";
                        } else if (
                          completedLocations > 0 &&
                          totalLocations > 0
                        ) {
                          status = "In Completed";
                        }

                        return (
                          <tr key={plan._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {format(new Date(plan.visitDate), "MMM dd, yyyy")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {totalLocations} location
                              {totalLocations !== 1 ? "s" : ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      completionPercentage === 100
                                        ? "bg-green-600"
                                        : completionPercentage > 0
                                        ? "bg-red-500"
                                        : "bg-blue-600"
                                    }`}
                                    style={{
                                      width: `${completionPercentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <span>{completionPercentage}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 capitalize inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : status === "In Completed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() =>
                                  navigate(`/plan-detail/${plan._id}`)
                                }
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {getTotalPages(plans) > 1 && (
                  <div className="flex justify-end mt-6">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPlansPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPlansPage === 1}
                        className={`p-2 rounded-full ${
                          currentPlansPage === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from(
                        { length: Math.min(5, getTotalPages(plans)) },
                        (_, i) => {
                          // Show pages around current page
                          let pageNum;
                          const totalPages = getTotalPages(plans);

                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPlansPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPlansPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPlansPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPlansPage(pageNum)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                currentPlansPage === pageNum
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          setCurrentPlansPage((prev) =>
                            Math.min(prev + 1, getTotalPages(plans))
                          )
                        }
                        disabled={currentPlansPage === getTotalPages(plans)}
                        className={`p-2 rounded-full ${
                          currentPlansPage === getTotalPages(plans)
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Manager Notes
                </h3>

                {plans.some(
                  (plan) =>
                    plan.hrNotes?.length > 0 ||
                    plan.lmNotes?.length > 0 ||
                    plan.dmNotes?.length > 0 ||
                    plan.gmNotes?.length > 0
                ) ? (
                  <>
                    <div className="space-y-6">
                      {paginate(
                        plans.filter(
                          (plan) =>
                            plan.hrNotes?.length > 0 ||
                            plan.lmNotes?.length > 0 ||
                            plan.dmNotes?.length > 0 ||
                            plan.gmNotes?.length > 0
                        ),
                        currentNotesPage
                      ).map((plan) => (
                        <div
                          key={plan._id}
                          className="bg-white rounded-lg border border-gray-200 p-6"
                        >
                          <h4 className="font-medium text-gray-900 mb-2">
                            Plan for{" "}
                            {format(new Date(plan.visitDate), "MMMM dd, yyyy")}
                          </h4>

                          {plan.hrNotes?.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                HR Notes:
                              </h5>
                              <ul className="space-y-2">
                                {plan.hrNotes.map((note, idx) => (
                                  <li
                                    key={note._id || idx}
                                    className="bg-blue-50 p-3 rounded-md"
                                  >
                                    <p className="text-sm text-gray-800">
                                      {note.type}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {plan.lmNotes?.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Line Manager Notes:
                              </h5>
                              <ul className="space-y-2">
                                {plan.lmNotes.map((note, idx) => (
                                  <li
                                    key={note._id || idx}
                                    className="bg-green-50 p-3 rounded-md"
                                  >
                                    <p className="text-sm text-gray-800">
                                      {note.note}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {plan.dmNotes?.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                District Manager Notes:
                              </h5>
                              <ul className="space-y-2">
                                {plan.dmNotes.map((note, idx) => (
                                  <li
                                    key={note._id || idx}
                                    className="bg-yellow-50 p-3 rounded-md"
                                  >
                                    <p className="text-sm text-gray-800">
                                      {note.note || note.type}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {plan.gmNotes?.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                General Manager Notes:
                              </h5>
                              <ul className="space-y-2">
                                {plan.gmNotes.map((note, idx) => (
                                  <li
                                    key={note._id || idx}
                                    className="bg-purple-50 p-3 rounded-md"
                                  >
                                    <p className="text-sm text-gray-800">
                                      {note.note || note.type}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {getTotalPages(
                      plans.filter(
                        (plan) =>
                          plan.hrNotes?.length > 0 ||
                          plan.lmNotes?.length > 0 ||
                          plan.dmNotes?.length > 0 ||
                          plan.gmNotes?.length > 0
                      )
                    ) > 1 && (
                      <div className="flex justify-end mt-6">
                        <nav className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setCurrentNotesPage((prev) =>
                                Math.max(prev - 1, 1)
                              )
                            }
                            disabled={currentNotesPage === 1}
                            className={`p-2 rounded-full ${
                              currentNotesPage === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            <FiChevronLeft className="w-5 h-5" />
                          </button>

                          {Array.from(
                            {
                              length: Math.min(
                                5,
                                getTotalPages(
                                  plans.filter(
                                    (plan) =>
                                      plan.hrNotes?.length > 0 ||
                                      plan.lmNotes?.length > 0 ||
                                      plan.dmNotes?.length > 0 ||
                                      plan.gmNotes?.length > 0
                                  )
                                )
                              ),
                            },
                            (_, i) => {
                              // Show pages around current page
                              let pageNum;
                              const totalPages = getTotalPages(
                                plans.filter(
                                  (plan) =>
                                    plan.hrNotes?.length > 0 ||
                                    plan.lmNotes?.length > 0 ||
                                    plan.dmNotes?.length > 0 ||
                                    plan.gmNotes?.length > 0
                                )
                              );

                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentNotesPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentNotesPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentNotesPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentNotesPage(pageNum)}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    currentNotesPage === pageNum
                                      ? "bg-blue-50 text-blue-600"
                                      : "text-gray-500 hover:bg-gray-100"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}

                          <button
                            onClick={() =>
                              setCurrentNotesPage((prev) =>
                                Math.min(
                                  prev + 1,
                                  getTotalPages(
                                    plans.filter(
                                      (plan) =>
                                        plan.hrNotes?.length > 0 ||
                                        plan.lmNotes?.length > 0 ||
                                        plan.dmNotes?.length > 0 ||
                                        plan.gmNotes?.length > 0
                                    )
                                  )
                                )
                              )
                            }
                            disabled={
                              currentNotesPage ===
                              getTotalPages(
                                plans.filter(
                                  (plan) =>
                                    plan.hrNotes?.length > 0 ||
                                    plan.lmNotes?.length > 0 ||
                                    plan.dmNotes?.length > 0 ||
                                    plan.gmNotes?.length > 0
                                )
                              )
                            }
                            className={`p-2 rounded-full ${
                              currentNotesPage ===
                              getTotalPages(
                                plans.filter(
                                  (plan) =>
                                    plan.hrNotes?.length > 0 ||
                                    plan.lmNotes?.length > 0 ||
                                    plan.dmNotes?.length > 0 ||
                                    plan.gmNotes?.length > 0
                                )
                              )
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            <FiChevronRight className="w-5 h-5" />
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No manager notes available for this user's plans.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
