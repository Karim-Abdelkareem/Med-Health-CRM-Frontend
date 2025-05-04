import React from "react";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { FaEye, FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
export default function DaliyPlan({
  planData,
  setSelectedPlanData,
  setIsViewModalOpen,
  setIsEditModalOpen,
}) {
  return (
    <div>
      {" "}
      <div className="space-y-4">
        {planData.plans?.length > 0 ? (
          (() => {
            // Find the current day's plan
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison

            // Find plan for current day or closest future day
            const currentDayPlan = planData.plans.find((plan) => {
              const planDate = new Date(plan.visitDate);
              planDate.setHours(0, 0, 0, 0);
              return planDate.getTime() === today.getTime();
            });

            // Find closest upcoming plan if no plan for today
            const upcomingPlan =
              !currentDayPlan &&
              planData.plans
                .filter((plan) => new Date(plan.visitDate) > today)
                .sort(
                  (a, b) => new Date(a.visitDate) - new Date(b.visitDate)
                )[0];

            const planToShow =
              currentDayPlan || upcomingPlan || planData.plans[0];

            return (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-800">
                        {currentDayPlan
                          ? "Today's Plan"
                          : upcomingPlan
                          ? "Upcoming Plan"
                          : "Latest Plan"}
                      </h2>
                      <p className="text-blue-600 mt-1 flex items-center gap-2">
                        <CiCalendarDate size={18} />
                        {new Date(planToShow.visitDate).toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <FaEye
                        size={22}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                        onClick={() => {
                          setSelectedPlanData(planToShow);
                          setIsViewModalOpen(true);
                        }}
                      />
                      <FiEdit
                        size={22}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                        onClick={() => {
                          setSelectedPlanData(planToShow);
                          setIsEditModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <IoLocationSharp size={20} />
                      Locations
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {planToShow.locations.map((region, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-800">
                              {region.location.locationName}
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                {
                                  completed: "bg-green-100 text-green-800",
                                  pending: "bg-yellow-100 text-yellow-800",
                                  cancelled: "bg-red-100 text-red-800",
                                }[region.status?.toLowerCase().trim()] ||
                                "bg-gray-100"
                              }`}
                            >
                              {region.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {region.location.address}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* General Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <CgNotes size={20} />
                        Notes
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {planToShow.notes?.length > 0 ? (
                          <p className="text-gray-700 whitespace-pre-line">
                            {planToShow.notes}
                          </p>
                        ) : (
                          <p className="text-gray-700 whitespace-pre-line">
                            No notes added
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Helper function to render note sections */}
                    {["gmNotes", "dmNotes", "lmNotes", "hrNotes"].map(
                      (noteType) => (
                        <div key={noteType}>
                          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <CgNotes size={20} />
                            {noteType.toUpperCase().replace("NOTES", "")} Notes
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {planToShow[noteType]?.length > 0 ? (
                              <ul className="text-gray-700 whitespace-pre-line italic space-y-2">
                                {planToShow[noteType].map((note, idx) => (
                                  <li key={idx}>• {note}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-700 whitespace-pre-line italic">
                                No notes added
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-500">
              No daily plan available
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
