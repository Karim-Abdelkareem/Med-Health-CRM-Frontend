import React, { useState, useEffect } from "react";
import {
  BarChart,
  ChevronDown,
  Calendar,
  Users,
  UserCircle,
  PlaneLanding,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import Chart from "react-apexcharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    representatives: 0,
    holidays: 0,
  });
  const [kpiData, setKpiData] = useState([]);
  const [planStats, setPlanStats] = useState({
    completed: 0,
    inProgress: 0,
    planned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyGoal, setMonthlyGoal] = useState(85);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Simulate API calls with setTimeout
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data for demonstration
        const usersData = Array(24)
          .fill()
          .map((_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            role: i % 3 === 0 ? "representative" : "regular",
          }));

        const plansData = Array(18)
          .fill()
          .map((_, i) => ({
            id: i + 1,
            title: `Plan ${i + 1}`,
            locations: Array(Math.floor(Math.random() * 5) + 1)
              .fill()
              .map((_, j) => ({
                id: j + 1,
                name: `Location ${j + 1}`,
                status:
                  i % 4 === 0
                    ? "completed"
                    : i % 3 === 0
                    ? "completed"
                    : i % 2 === 0
                    ? "in-progress"
                    : "planned",
              })),
          }));

        // Calculate plan statistics
        const planStatsData = calculatePlanStats(plansData);

        setStats({
          users: usersData.length,
          plans: plansData.length,
          representatives: usersData.filter(
            (user) => user.role === "representative"
          ).length,
          holidays: 15, // Mock remaining holidays
        });

        setPlanStats(planStatsData);

        // Generate KPI data for the selected year
        setKpiData(generateKpiData(selectedYear));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear]);

  // Calculate plan statistics based on location completion status
  const calculatePlanStats = (plans) => {
    let completedPlans = 0;
    let inProgressPlans = 0;
    let plannedPlans = 0;

    plans.forEach((plan) => {
      const locations = plan.locations || [];
      const totalLocations = locations.length;
      const completedLocations = locations.filter(
        (loc) => loc.status === "completed"
      ).length;
      const inProgressLocations = locations.filter(
        (loc) => loc.status === "in-progress"
      ).length;

      if (completedLocations === totalLocations && totalLocations > 0) {
        completedPlans++;
      } else if (completedLocations > 0 || inProgressLocations > 0) {
        inProgressPlans++;
      } else {
        plannedPlans++;
      }
    });

    return {
      completed: completedPlans,
      inProgress: inProgressPlans,
      planned: plannedPlans,
    };
  };

  const generateKpiData = (year) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Using a seeded random based on the year for consistent results per year
    const seedRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return months.map((month, idx) => {
      const seed = year * 100 + idx;
      // Generate achieved values that hover around the target with some variance
      const variance = seedRandom(seed) * 10 - 5; // -5 to +5 variance
      const achieved = Math.round(monthlyGoal + variance);

      return {
        month,
        target: monthlyGoal,
        achieved: achieved,
      };
    });
  };

  const chartOptions = {
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
      categories: kpiData.map((item) => item.month),
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
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
        colorStops: [
          {
            offset: 0,
            color: "#4F46E5",
            opacity: 0.6,
          },
          {
            offset: 100,
            color: "#4F46E5",
            opacity: 0,
          },
        ],
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: ["#4F46E5", "#94A3B8"],
      strokeColors: "#FFFFFF",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    tooltip: {
      theme: "light",
      marker: {
        show: true,
      },
      y: {
        formatter: (value) => `${value}%`,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#64748B",
      },
    },
  };

  const chartSeries = [
    {
      name: "Achievement",
      data: kpiData.map((item) => item.achieved),
    },
    {
      name: "Target",
      data: kpiData.map((item) => item.target),
      strokeDashArray: 4,
    },
  ];

  const donutOptions = {
    labels: ["Completed", "In Progress", "Planned"],
    colors: ["#10B981", "#F59E0B", "#4F46E5"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontWeight: 600,
              color: "#334155",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              color: "#334155",
              formatter: function (val) {
                return val;
              },
            },
            total: {
              show: true,
              label: "Total Plans",
              fontSize: "14px",
              fontWeight: 600,
              color: "#64748B",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
  };

  const total = planStats.completed + planStats.inProgress + planStats.planned;
  const completedPercent =
    total > 0 ? ((planStats.completed / total) * 100).toFixed(1) : 0;
  const inProgressPercent =
    total > 0 ? ((planStats.inProgress / total) * 100).toFixed(1) : 0;
  const plannedPercent =
    total > 0 ? ((planStats.planned / total) * 100).toFixed(1) : 0;

  const donutSeries = [
    planStats.completed,
    planStats.inProgress,
    planStats.planned,
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500">
            Welcome back! Here's what's happening with your organization.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.users}
            icon={<Users className="text-indigo-600" />}
            change="+5%"
            trend="up"
          />
          <StatsCard
            title="Total Plans"
            value={stats.plans}
            icon={<Calendar className="text-emerald-600" />}
            change="+12%"
            trend="up"
          />
          <StatsCard
            title="Representatives"
            value={stats.representatives}
            icon={<UserCircle className="text-amber-600" />}
            change="+3%"
            trend="up"
          />
          <StatsCard
            title="Holiday Days"
            value={stats.holidays}
            icon={<PlaneLanding className="text-purple-600" />}
            change="Remaining"
            trend="neutral"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* KPI Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  KPI Performance
                </h2>
                <p className="text-sm text-gray-500">
                  Monthly achievement vs targets
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button className="bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-1 transition">
                    <BarChart size={16} />
                    KPI
                    <ChevronDown size={16} />
                  </button>
                </div>
                <select
                  className="bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-25 transition"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                </select>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                  <MoreHorizontal size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="h-80">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height="100%"
                width="100%"
              />
            </div>
          </div>

          {/* Plan Status Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Plan Status
                </h2>
                <p className="text-sm text-gray-500">
                  Distribution of current plans
                </p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <MoreHorizontal size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="h-64 mb-6">
              <Chart
                options={donutOptions}
                series={donutSeries}
                type="donut"
                height="100%"
              />
            </div>
            <div className="space-y-4">
              <StatusRow
                color="#10B981"
                label="Completed"
                count={planStats.completed}
                percentage={completedPercent}
              />
              <StatusRow
                color="#F59E0B"
                label="In Progress"
                count={planStats.inProgress}
                percentage={inProgressPercent}
              />
              <StatusRow
                color="#4F46E5"
                label="Planned"
                count={planStats.planned}
                percentage={plannedPercent}
              />
            </div>
          </div>
        </div>

        {/* KPI Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Monthly KPI Breakdown
              </h2>
              <p className="text-sm text-gray-500">
                Detailed view of KPI targets vs. achievements
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Target
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Achievement
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Variance
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {kpiData.map((data, index) => {
                  const variance = data.achieved - data.target;
                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {data.month}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-gray-700">
                        {data.target}%
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-gray-700">
                        {data.achieved}%
                      </td>
                      <td
                        className={`text-right py-3 px-4 text-sm font-medium ${
                          variance >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {variance > 0 ? `+${variance}` : variance}%
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            variance >= 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {variance >= 0 ? "Achieved" : "Missed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
      {value.toLocaleString()}
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
