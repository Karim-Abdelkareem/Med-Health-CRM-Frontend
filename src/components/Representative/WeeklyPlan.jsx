import React from "react";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { FaEye, FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
export default function WeeklyPlan({
  planData,
  openWeeks,
  setOpenWeeks,
  setIsDeleteModalOpen,
  setIsEditModalOpen,
  setSelectedPlanData,
  setIsViewModalOpen,
  setSelectedPlanId,
}) {
  return (
    <div>
      {" "}
      <div className="space-y-4">
        {planData.plans?.length > 0 ? (
          Array.from(
            { length: Math.ceil(planData.plans.length / 6) },
            (_, weekIndex) => {
              const weekPlans = planData.plans.slice(
                weekIndex * 6,
                (weekIndex + 1) * 6
              );
              const weekId = `week-${weekIndex}`;
              const isOpen = openWeeks[weekId] || false;

              return (
                <div
                  key={weekIndex}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Accordion Header */}
                  <div
                    className="bg-gray-100 p-4 cursor-pointer flex items-center justify-between hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      // Toggle this specific accordion using React state
                      setOpenWeeks((prev) => ({
                        ...prev,
                        [weekId]: !prev[weekId],
                      }));
                    }}
                  >
                    <h2 className="text-xl font-bold text-gray-800">
                      Week {weekIndex + 1} ({weekPlans.length} days)
                    </h2>
                    <div
                      className={`transform transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isOpen ? "max-h-full" : "max-h-0"
                    }`}
                  >
                    <div className="p-4 bg-white">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {weekPlans.map((plan, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold mb-2">
                                Day {weekIndex * 6 + dayIndex + 1}
                              </h3>
                              <div className="flex gap-2">
                                <FaEye
                                  size={20}
                                  className="text-gray-600 hover:text-gray-700 cursor-pointer"
                                  onClick={() => {
                                    setSelectedPlanData(plan);
                                    setIsViewModalOpen(true);
                                  }}
                                />
                                <FiEdit
                                  size={18}
                                  className="text-blue-600 hover:text-blue-700 cursor-pointer"
                                  onClick={() => {
                                    setSelectedPlanData(plan);
                                    setIsEditModalOpen(true);
                                  }}
                                />
                                <FaTrash
                                  size={18}
                                  className="text-red-600 hover:text-red-700 cursor-pointer"
                                  onClick={() => {
                                    setSelectedPlanId(plan._id);
                                    setIsDeleteModalOpen(true);
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm mt-2">
                              <CiCalendarDate size={16} />
                              <p className="text-gray-600">
                                {new Date(plan.visitDate).toLocaleDateString(
                                  "en-GB"
                                )}
                              </p>
                            </div>

                            <div className="mt-3 space-y-2">
                              {plan.locations.map((region, locationIndex) => (
                                <div
                                  key={locationIndex}
                                  className="flex items-start gap-2"
                                >
                                  <IoLocationSharp
                                    size={16}
                                    className="mt-1 text-gray-600"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {region.location.locationName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {region.location.address}
                                    </p>
                                    <div className="flex items-center mt-1">
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                          {
                                            completed:
                                              "bg-green-100 text-green-800",
                                            pending:
                                              "bg-yellow-100 text-yellow-800",
                                            cancelled:
                                              "bg-red-100 text-red-800",
                                          }[
                                            region.status?.toLowerCase().trim()
                                          ] || "bg-gray-100"
                                        }`}
                                      >
                                        {region.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {plan.notes && (
                              <div className="mt-3 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-1 text-sm">
                                  <CgNotes size={14} />
                                  <p className="text-gray-700 font-medium">
                                    Notes
                                  </p>
                                </div>
                                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                                  {plan.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )
        ) : (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-500">
              No weekly plans added
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
