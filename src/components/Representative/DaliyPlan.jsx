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
  // Helper function to get location name from ID
  const getLocationName = (plan, locationId) => {
    if (!plan || !plan.locations) return "Unknown Location";

    const location = plan.locations.find(
      (loc) => loc.location._id === locationId
    );

    return location ? location.location.locationName : "Unknown Location";
  };

  // Helper function to render note sections with special handling for HR notes
  const renderNoteSection = (title, notes, planToShow) => (
    <div key={title}>
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <CgNotes size={20} />
        {title}
      </h3>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        {title === "HR Notes" && Array.isArray(notes) ? (
          notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-blue-700">
                      {note.user?.name || "HR Member"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  {note.location && (
                    <div className="mb-2 text-sm text-gray-600">
                      <span className="font-medium">Location:</span>{" "}
                      {typeof note.location === "object"
                        ? note.location.locationName
                        : "Unknown Location"}
                    </div>
                  )}
                  <p className="text-gray-700">
                    {note.type || "No note content"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-line italic">
              No HR notes added
            </p>
          )
        ) : Array.isArray(notes) ? (
          notes.length > 0 ? (
            <ul className="text-gray-700 whitespace-pre-line italic space-y-2">
              {notes.map((note, idx) => (
                <li key={idx}>• {note}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 whitespace-pre-line italic">
              No notes added
            </p>
          )
        ) : (
          <p className="text-gray-700 whitespace-pre-line italic">
            No notes added
          </p>
        )}
      </div>
    </div>
  );

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
                                  incomplete: "bg-red-100 text-red-800",
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
                    {planToShow.notes?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <CgNotes size={20} />
                          Notes
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="space-y-2">
                            {planToShow.notes.map((noteItem, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-white rounded border border-gray-100"
                              >
                                <div className="border-b border-gray-100 pb-2 mb-2">
                                  <h4 className="font-medium text-blue-700">
                                    Note #{idx + 1}
                                  </h4>
                                </div>
                                {typeof noteItem === "string" ? (
                                  <p>{noteItem}</p>
                                ) : (
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-gray-500">Location:</p>
                                      <p className="font-medium">
                                        {noteItem.location?.locationName ||
                                          (typeof noteItem.location === "string"
                                            ? getLocationName(
                                                planToShow,
                                                noteItem.location
                                              )
                                            : noteItem.locationName ||
                                              "Location")}
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <p className="text-gray-500">Note:</p>
                                      <p className="text-gray-700 whitespace-pre-line">
                                        {noteItem.note}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Use the renderNoteSection helper for all note types */}
                    {planToShow.gmNotes?.length > 0 &&
                      renderNoteSection(
                        "GM Notes",
                        planToShow.gmNotes,
                        planToShow
                      )}
                    {planToShow.dmNotes?.length > 0 &&
                      renderNoteSection(
                        "DM Notes",
                        planToShow.dmNotes,
                        planToShow
                      )}
                    {planToShow.lmNotes?.length > 0 &&
                      renderNoteSection(
                        "LM Notes",
                        planToShow.lmNotes,
                        planToShow
                      )}
                    {planToShow.hrNotes?.length > 0 &&
                      renderNoteSection(
                        "HR Notes",
                        planToShow.hrNotes,
                        planToShow
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
