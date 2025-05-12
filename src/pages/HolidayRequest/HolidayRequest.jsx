import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import holidayService from "../../store/Holidays/HolidaysService";
import { format } from "date-fns";

export default function HolidayRequest() {
  const [startDate, setStartDate] = useState(
    (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    })()
  );
  const [endDate, setEndDate] = useState(
    (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    })()
  );
  const [reason, setReason] = useState("");
  const [remainingDays, setRemainingDays] = useState(27);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holidayHistory, setHolidayHistory] = useState([]);

  // Calculate days between two dates (inclusive)
  const calculateDaysBetween = (start, end) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((end - start) / oneDay)) + 1;
    return diffDays;
  };

  // Calculate remaining days
  useEffect(() => {
    const fetchRemainingDays = async () => {
      try {
        const response = await holidayService.getRemainingDays();
        setRemainingDays(response.data);
      } catch (error) {
        console.error("Error fetching remaining days:", error);
      }
    };

    fetchRemainingDays();
  }, []);

  // Fetch holiday history
  useEffect(() => {
    const fetchHolidayHistory = async () => {
      try {
        const response = await holidayService.getHolidayHistory();
        setHolidayHistory(response.data);
      } catch (error) {
        console.error("Error fetching holiday history:", error);
      }
    };

    fetchHolidayHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates
    if (endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    const requestedDays = calculateDaysBetween(startDate, endDate);

    if (requestedDays > remainingDays) {
      toast.error(`You only have ${remainingDays} days remaining`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - replace with your actual API endpoint
      await holidayService.createHolidayRequest({
        startDate,
        endDate,
        reason,
        days: requestedDays,
      });
      // Mock successful response
      setTimeout(() => {
        toast.success("Holiday request submitted successfully");
        setReason("");
        // Update remaining days
        setRemainingDays((prev) => prev - requestedDays);
        // Add to history
        setHolidayHistory((prev) => [
          {
            startDate,
            endDate,
            status: "pending",
            days: requestedDays,
            reason,
          },
          ...prev,
        ]);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error submitting holiday request:", error);
      toast.error("Failed to submit holiday request");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Holiday Request</h1>
          <p className="mt-2 text-sm text-gray-600">
            Request time off and view your remaining holiday allowance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Holiday Request Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Request Holiday</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        minDate={(() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return tomorrow;
                        })()}
                        dateFormat="dd/MM/yyyy"
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
                        dateFormat="dd/MM/yyyy"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Holiday
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please provide a reason for your holiday request"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        {calculateDaysBetween(startDate, endDate)}
                      </span>{" "}
                      days requested
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Holiday History */}
            <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Holiday History</h2>
                {holidayHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Days
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {holidayHistory.map((holiday, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {format(
                                new Date(holiday.startDate),
                                "dd/MM/yyyy"
                              )}{" "}
                              -{" "}
                              {format(new Date(holiday.endDate), "dd/MM/yyyy")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {holiday.days}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {holiday.reason}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 capitalize inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  holiday.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : holiday.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {holiday.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No holiday history found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Remaining Days Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-fit">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Holiday Allowance
                </h2>
                <div className="flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-blue-50 border-4 border-blue-100 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-blue-600">
                      {remainingDays}
                    </span>
                    <span className="text-sm text-gray-600 mt-1">
                      days remaining
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">
                    Annual Entitlement
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total days:</span>
                      <span className="font-medium">27</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Used:</span>
                      <span className="font-medium">{27 - remainingDays}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium text-blue-600">
                        {remainingDays}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Holiday Policy</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                    <li>
                      Requests must be submitted at least 24 Hours in advance
                    </li>
                    <li>Maximum consecutive days: 14</li>
                    <li>Holiday year runs from January to December</li>
                    <li>Unused days cannot be carried over to next year</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
