import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import planService from "../../store/Plan/planyService";
import { FiEye } from "react-icons/fi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (user?.role === "R") {
      fetchPlans();
    }
  }, [startDate, endDate]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await planService.getMonthlyPlans(
        startDate.toISOString(),
        endDate.toISOString(),
        user.id
      );
      setPlans(response.data);
      setCurrentPage(1); // Reset to first page when new data is loaded
    } catch {
      toast.error("Failed to load plans history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (planId, locationId) => {
    navigate(`/location-details/${planId}/${locationId}`);
  };

  // Calculate pagination
  const allLocations = plans.flatMap((plan) =>
    plan.locations.map((location) => ({
      ...location,
      planId: plan._id,
      visitDate: plan.visitDate,
      notes: plan.notes,
    }))
  );

  const totalPages = Math.ceil(allLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLocations = allLocations.slice(startIndex, endIndex);

  if (user?.role !== "R") {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            This page is only available for representatives.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Plans History</h2>
          </div>

          <div className="p-6">
            {/* Date Range Picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  locale={enUS}
                  dateFormat="MM/dd/yyyy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  locale={enUS}
                  dateFormat="MM/dd/yyyy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Plans List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : plans.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          My Notes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentLocations.map((locationData) => (
                        <tr key={locationData._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {locationData.visitDate
                              ? format(
                                  new Date(locationData.visitDate),
                                  "MM/dd/yyyy",
                                  {
                                    locale: enUS,
                                  }
                                )
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {locationData.location.locationName}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-left">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                locationData.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {locationData.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="truncate max-w-40">
                              {locationData.notes
                                .filter(
                                  (note) =>
                                    note.location === locationData.location._id
                                )
                                .map((note) => note.note)
                                .join(", ") || "No notes"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-left">
                            <button
                              onClick={() => {
                                handleViewDetails(
                                  locationData.planId,
                                  locationData.location._id
                                );
                                console.log(locationData.location._id);
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            >
                              <FiEye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-end mt-6">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`p-2 rounded-full ${
                          currentPage === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentPage === index + 1
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-full ${
                          currentPage === totalPages
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
                No plans found for the selected date range
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
