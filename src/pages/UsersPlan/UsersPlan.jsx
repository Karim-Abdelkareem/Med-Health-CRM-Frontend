import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import userService from "../../store/User/UserService";
import planService from "../../store/Plan/planyService";

// Reusable Select Input Component
const SelectInput = ({ id, label, value, onChange, options, placeholder }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-lg font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition duration-200"
        >
          <option value="">{placeholder || "Select an option"}</option>
          {options.map((option) => (
            <option
              key={option.value || option._id}
              value={option.value || option._id}
            >
              {option.label || option.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Reusable Date Input Component
const DateInput = ({ label, value, onChange }) => {
  return (
    <div className="flex-1">
      <h3 className="mb-2 text-lg font-medium text-gray-700 capitalize">
        {label}:
      </h3>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-2 border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
      />
    </div>
  );
};

// Plan Card Component
const PlanCard = ({ plan }) => {
  const navigate = useNavigate();
  // Handle both old and new data structures
  const visitDate =
    plan.visitDate || plan.date || plan.startDate || new Date().toISOString();

  // Handle regions/plans array
  const regions = plan.region || plan.plans || plan.locations || [];

  // Get completion status
  const completedRegions = regions.filter(
    (region) => region.status?.toLowerCase() === "completed"
  ).length;
  const totalRegions = regions.length;
  const completionPercentage =
    totalRegions > 0 ? Math.round((completedRegions / totalRegions) * 100) : 0;

  // Handle click to view plan details
  const handleViewDetails = () => {
    navigate(`/plan-detail/${plan._id}`);
  };

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {new Date(visitDate).toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <p className="text-gray-600 mt-1">
            {totalRegions} location{totalRegions !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-lg font-semibold">
            <span
              className={
                completionPercentage === 100
                  ? "text-green-600"
                  : "text-blue-600"
              }
            >
              {completionPercentage}%
            </span>
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
            <div
              className={`h-2.5 rounded-full ${
                completionPercentage === 100 ? "bg-green-600" : "bg-blue-600"
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {completedRegions} of {totalRegions} completed
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent onClick
            navigate(`/plan-detail/${plan._id}`);
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          View Details
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ title, message, icon }) => {
  return (
    <div className="bg-white p-10 rounded-xl border border-gray-200 text-center">
      <div className="flex flex-col items-center justify-center">
        {icon}
        <h3 className="mt-4 text-2xl font-semibold text-gray-700">{title}</h3>
        {message && <p className="mt-2 text-gray-500">{message}</p>}
      </div>
    </div>
  );
};

export default function UsersPlan() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const currentDate = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [plansData, setPlansData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Role options
  const roleOptions = [
    { label: "Line Manager", value: "LM" },
    { label: "Area Sales Manager", value: "Area" },
    { label: "District Manager", value: "DM" },
    { label: "Representative", value: "R" },
  ];

  // Fetch users based on role
  const fetchUsersByRole = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const response = await userService.getUsersByRole(selectedRole);
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      fetchUsersByRole();
    }
  }, [selectedRole]);

  // Fetch plans
  const getMonthlyPlans = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await planService.getMonthlyPlans(
        startDate,
        endDate,
        selectedUser
      );
      setPlansData(response.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      getMonthlyPlans();
    }
  }, [selectedUser, startDate, endDate]);

  // Handle role change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedUser("");
    setPlansData([]);
  };

  // Handle user change
  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">User Plans</h1>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectInput
            id="role-select"
            label="Select Role"
            value={selectedRole}
            onChange={handleRoleChange}
            options={roleOptions}
            placeholder="Select Role"
          />

          {selectedRole && (
            <div className="animate-fadeIn">
              <SelectInput
                id="user-select"
                label="Select User"
                value={selectedUser}
                onChange={handleUserChange}
                options={users || []}
                placeholder={isLoading ? "Loading users..." : "Select User"}
              />
            </div>
          )}
        </div>
      </div>

      {/* Plans Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">User Plans</h2>
          {selectedUser && (
            <button
              onClick={getMonthlyPlans}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Refresh
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          {selectedUser ? (
            <>
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <DateInput
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                />
                <DateInput
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>

              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : plansData.length > 0 ? (
                <div>
                  {plansData.map((plan) => (
                    <PlanCard key={plan._id} plan={plan} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Plans Found"
                  message="Try adjusting your date range to see more results."
                  icon={
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  }
                />
              )}
            </>
          ) : (
            <EmptyState
              title="No User Selected"
              message="Please select a role and user to view their plans."
              icon={
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
