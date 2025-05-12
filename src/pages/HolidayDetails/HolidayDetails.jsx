import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import holidayService from "../../store/Holidays/HolidaysService";

export default function HolidayDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [holiday, setHoliday] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch holiday details
  useEffect(() => {
    const fetchHolidayDetails = async () => {
      try {
        setIsLoading(true);
        const response = await holidayService.getHolidayById(id);
        setHoliday(response.data.data);
      } catch (error) {
        console.error("Error fetching holiday details:", error);
        toast.error("Failed to load holiday details");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchHolidayDetails();
    }
  }, [id]);

  // Calculate days between two dates (inclusive)
  const calculateDaysBetween = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;
    return diffDays;
  };

  // Handle approve request
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await holidayService.approveRejectHoliday(id, "approved");
      toast.success("Holiday approved successfully");
      navigate(-1);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.error.message || "Failed to approve holiday"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject request
  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await holidayService.approveRejectHoliday(id, "rejected");
      toast.success("Holiday rejected successfully");
      navigate(-1);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.error.message ||
          "Failed to reject holiday request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!holiday) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Holiday Request Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            The holiday request you're looking for doesn't exist or you don't
            have permission to view it.
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" /> Back to Holidays
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Holiday Request Details
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Holiday Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold mb-4">
                    Request Information
                  </h2>
                  <span
                    className={`px-3 capitalize py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      holiday.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : holiday.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {holiday.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Employee
                    </h3>
                    <div className="mt-1 flex items-center">
                      <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-base font-medium text-gray-900">
                        {holiday.user?.name || "Employee Name"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <p className="mt-1 text-base font-medium text-gray-900">
                      {(() => {
                        switch (holiday.user?.role) {
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
                      })()}{" "}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Start Date
                    </h3>
                    <div className="mt-1 flex items-center">
                      <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-base font-medium text-gray-900">
                        {format(new Date(holiday.startDate), "dd MMMM yyyy")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      End Date
                    </h3>
                    <div className="mt-1 flex items-center">
                      <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-base font-medium text-gray-900">
                        {format(new Date(holiday.endDate), "dd MMMM yyyy")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Duration
                    </h3>
                    <div className="mt-1 flex items-center">
                      <FiClock className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-base font-medium text-gray-900">
                        {holiday.days ||
                          calculateDaysBetween(
                            holiday.startDate,
                            holiday.endDate
                          )}{" "}
                        days
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Requested On
                    </h3>
                    <p className="mt-1 text-base font-medium text-gray-900">
                      {format(new Date(holiday.createdAt), "dd MMMM yyyy")}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500">
                    Reason for Holiday
                  </h3>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {holiday.reason}
                    </p>
                  </div>
                </div>
                {holiday.approvedBy && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500">
                      Approved/Rejected By
                    </h3>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-line">
                        {holiday.approvedBy
                          ?.map((user) => user.name)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Manager Actions */}
                {holiday.status === "pending" && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Manager Actions
                    </h3>
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FiCheck className="mr-2 -ml-1 h-5 w-5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FiX className="mr-2 -ml-1 h-5 w-5" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Employee Info Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Employee Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {holiday.user?.name || "Employee Name"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {holiday.user?.email || "employee@example.com"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {(() => {
                        switch (holiday.user?.role) {
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
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Holiday Allowance Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Holiday Allowance
                </h2>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-blue-100 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {27 - holiday.user?.holidaysTaken || 27}
                    </span>
                    <span className="text-xs text-gray-600 mt-1">
                      days remaining
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total days:</span>
                    <span className="font-medium text-sm">27</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600 text-sm">Used:</span>
                    <span className="font-medium text-sm">
                      {holiday.user?.holidaysTaken || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600 text-sm">Remaining:</span>
                    <span className="font-medium text-sm text-blue-600">
                      {27 - holiday.user?.holidaysTaken || 27}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
