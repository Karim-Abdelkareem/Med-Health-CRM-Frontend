import React, { useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";

export default function MonthlyPlan({ planData, selectedPlan }) {
  // State to keep track of which day is selected
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  // Handle day selection
  const handleDaySelect = (index) => {
    setSelectedDayIndex(index === selectedDayIndex ? null : index);
  };

  // Helper function to render note sections with special handling for HR notes
  const renderNoteSection = (title, notes) => {
    // Only render if notes exist and have content
    if (!notes || (Array.isArray(notes) && notes.length === 0)) {
      return null;
    }

    return (
      <div key={title}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CgNotes size={20} />
          {title}
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          {title === "HR Notes" && Array.isArray(notes) ? (
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
          ) : Array.isArray(notes) ? (
            <ul className="text-gray-700 whitespace-pre-line italic space-y-2">
              {notes.map((note, idx) => (
                <li key={idx}>
                  {typeof note === "string" ? (
                    `• ${note}`
                  ) : note && typeof note === "object" ? (
                    <div className="p-2 bg-white rounded border border-gray-100">
                      {note.location && (
                        <div className="mb-1 text-sm text-gray-600">
                          <span className="font-medium">Location:</span>{" "}
                          {typeof note.location === "string"
                            ? note.location
                            : note.location.locationName || "Unknown Location"}
                        </div>
                      )}
                      <div>• {note.note || "No note content"}</div>
                    </div>
                  ) : (
                    "• Invalid note format"
                  )}
                </li>
              ))}
            </ul>
          ) : notes ? (
            typeof notes === "string" ? (
              <p className="text-gray-700 whitespace-pre-line">{notes}</p>
            ) : typeof notes === "object" ? (
              <div className="p-2 bg-white rounded border border-gray-100">
                {notes.location && (
                  <div className="mb-1 text-sm text-gray-600">
                    <span className="font-medium">Location:</span>{" "}
                    {typeof notes.location === "string"
                      ? notes.location
                      : notes.location.locationName || "Unknown Location"}
                  </div>
                )}
                <div>{notes.note || "No note content"}</div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-line">
                Invalid note format
              </p>
            )
          ) : (
            <p className="text-gray-700 whitespace-pre-line">No notes added</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Day selector grid */}
      {planData.plans?.length > 0 ? (
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Select a day to view details:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {/* Generate all days of the month */}
              {(() => {
                // Get the month from the first plan
                const firstPlanDate = new Date(planData.plans[0].visitDate);
                const year = firstPlanDate.getFullYear();
                const month = firstPlanDate.getMonth();

                // Get today's date for comparison
                const today = new Date();
                const isToday = (date) => {
                  return (
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                  );
                };

                // Get the number of days in the month
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                // Create array of all days in the month
                const allDays = Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);

                  // Find if there's a plan for this day
                  const planForDay = planData.plans.find((plan) => {
                    const planDate = new Date(plan.visitDate);
                    return (
                      planDate.getDate() === day &&
                      planDate.getMonth() === month &&
                      planDate.getFullYear() === year
                    );
                  });

                  return {
                    day,
                    date,
                    dayName: date.toLocaleDateString("en-US", {
                      weekday: "short",
                    }),
                    hasPlan: !!planForDay,
                    planIndex: planForDay
                      ? planData.plans.indexOf(planForDay)
                      : null,
                    isToday: isToday(date),
                  };
                });

                return allDays.map((dayInfo, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      dayInfo.hasPlan && handleDaySelect(dayInfo.planIndex)
                    }
                    className={`p-3 rounded-lg border flex flex-col items-center transition-all ${
                      dayInfo.isToday
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : dayInfo.hasPlan &&
                          selectedDayIndex === dayInfo.planIndex
                        ? "bg-blue-50 border-blue-300 shadow-sm"
                        : dayInfo.hasPlan
                        ? "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        : "bg-gray-50 border-gray-200 opacity-70 cursor-default"
                    }`}
                  >
                    <span className="text-xs text-gray-500 mb-1">
                      {dayInfo.dayName}
                    </span>
                    <span
                      className={`font-bold text-lg mb-1 ${
                        dayInfo.isToday ? "text-indigo-600" : ""
                      }`}
                    >
                      Day {dayInfo.day}
                    </span>
                    <span className="text-xs text-gray-600">
                      {dayInfo.date.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {dayInfo.isToday && (
                      <span className="mt-1 text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        Today
                      </span>
                    )}
                    {!dayInfo.hasPlan && (
                      <span className="mt-1 text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                        Day Off
                      </span>
                    )}
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* Selected day details */}
          {selectedDayIndex !== null && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    Day{" "}
                    {new Date(
                      planData.plans[selectedDayIndex].visitDate
                    ).getDate()}{" "}
                    Plan
                  </h2>
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <CiCalendarDate size={18} />
                    {new Date(
                      planData.plans[selectedDayIndex].visitDate
                    ).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Locations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <IoLocationSharp size={20} />
                  Locations
                </h3>
                <div className="space-y-3">
                  {planData.plans[selectedDayIndex].locations.map(
                    (region, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {region.location.locationName}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {region.location.address}
                            </p>
                          </div>
                          <span
                            className={`h-fit text-xs px-2 py-1 rounded-full font-medium ${
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
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Notes - Only render if they exist */}
              <div className="space-y-6">
                {/* General Notes */}
                {planData.plans[selectedDayIndex].notes?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CgNotes size={20} />
                      Notes
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="space-y-2">
                        {planData.plans[selectedDayIndex].notes.map(
                          (noteItem, idx) => (
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
                                          ? noteItem.location
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
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Specific note types - Only render if they exist */}
                {planData.plans[selectedDayIndex].gmNotes?.length > 0 &&
                  renderNoteSection(
                    "GM Notes",
                    planData.plans[selectedDayIndex].gmNotes
                  )}
                {planData.plans[selectedDayIndex].dmNotes?.length > 0 &&
                  renderNoteSection(
                    "DM Notes",
                    planData.plans[selectedDayIndex].dmNotes
                  )}
                {planData.plans[selectedDayIndex].lmNotes?.length > 0 &&
                  renderNoteSection(
                    "LM Notes",
                    planData.plans[selectedDayIndex].lmNotes
                  )}
                {planData.plans[selectedDayIndex].hrNotes?.length > 0 &&
                  renderNoteSection(
                    "HR Notes",
                    planData.plans[selectedDayIndex].hrNotes
                  )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-500">
            No {selectedPlan} Plan Added
          </h2>
        </div>
      )}
    </div>
  );
}
