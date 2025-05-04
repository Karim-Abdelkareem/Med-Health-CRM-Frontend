import React, { useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { FaEye, FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

export default function MonthlyPlan({ planData, selectedPlan }) {
  // State to keep track of which day is selected
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  // Handle day selection
  const handleDaySelect = (index) => {
    setSelectedDayIndex(index === selectedDayIndex ? null : index);
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
              {planData.plans.map((plan, index) => (
                <button
                  key={index}
                  onClick={() => handleDaySelect(index)}
                  className={`p-3 rounded-lg border flex flex-col items-center transition-all ${
                    selectedDayIndex === index
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-bold text-lg mb-1">
                    Day {index + 1}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(plan.visitDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected day details */}
          {selectedDayIndex !== null && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    Day {selectedDayIndex + 1} Plan
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
                              Region {idx + 1}: {region.location.locationName}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {region.location.address}
                            </p>
                          </div>
                          <span
                            className={`h-fit text-xs px-2 py-1 rounded-full font-medium ${
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
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-6">
                {/* Notes */}
                {renderNoteSection(
                  "Notes",
                  planData.plans[selectedDayIndex].notes
                )}

                {/* GM, DM, LM, HR Notes */}
                {["gmNotes", "dmNotes", "lmNotes", "hrNotes"].map((key) =>
                  renderNoteSection(
                    key.toUpperCase().replace("NOTES", "") + " Notes",
                    planData.plans[selectedDayIndex][key]
                  )
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

const renderNoteSection = (title, notes) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
      <CgNotes size={20} />
      {title}
    </h3>
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      {Array.isArray(notes) ? (
        notes.length > 0 ? (
          notes.map((note, idx) => (
            <p key={idx} className="text-gray-700 whitespace-pre-line italic">
              {note}
            </p>
          ))
        ) : (
          <p className="text-gray-700 whitespace-pre-line italic">
            No notes added
          </p>
        )
      ) : notes ? (
        <p className="text-gray-700 whitespace-pre-line">{notes}</p>
      ) : (
        <p className="text-gray-700 whitespace-pre-line">No notes added</p>
      )}
    </div>
  </div>
);
