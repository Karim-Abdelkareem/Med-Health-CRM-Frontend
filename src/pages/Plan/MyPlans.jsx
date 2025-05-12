import React, { useEffect, useState } from "react";
import planService from "../../store/Plan/planyService";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import monthlyService from "../../store/Monthly/monthlyService";
import LocationMap from "../../components/Representative/PlanMap";
import EditPlanModal from "../../components/EditPlanModal";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function MyPlans() {
  const [planData, setplanData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [location, setLocation] = useState({
    startLatitude: null,
    startLongitude: null,
  });
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [showEndVisitModal, setShowEndVisitModal] = useState(false);
  const [takesFromUs, setTakesFromUs] = useState(false);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            startLatitude: position.coords.latitude,
            startLongitude: position.coords.longitude,
          });
        },
        (err) => {
          setError(err.message);
          toast.error(err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const fetchPlanData = async () => {
    try {
      setIsLoading(true);
      const response = await monthlyService.getCurrentMonthPlan();
      setplanData(response.data);

      // Find current day's plan for the map
      if (response.data.plans?.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find plan for current day or closest future day
        const currentDayPlan = response.data.plans.find((plan) => {
          const planDate = new Date(plan.visitDate);
          planDate.setHours(0, 0, 0, 0);
          return planDate.getTime() === today.getTime();
        });

        // Find closest upcoming plan if no plan for today
        const upcomingPlan =
          !currentDayPlan &&
          response.data.plans
            .filter((plan) => new Date(plan.visitDate) > today)
            .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))[0];

        const planToShow =
          currentDayPlan || upcomingPlan || response.data.plans[0];
        setSelectedPlanId(planToShow._id);
      }
    } catch (err) {
      console.error("Error fetching plan data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, []);

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState(null);

  const updateToVisited = async (planId, regionId) => {
    try {
      // Use the passed parameters instead of state values
      const planIdToUse = planId || selectedPlanId;
      const regionIdToUse = regionId || selectedRegionId;

      // Validate IDs before making the API call
      if (!planIdToUse || !regionIdToUse) {
        toast.error("Invalid plan or location data");
        return;
      }

      await planService.updateToVisited(planIdToUse, regionIdToUse, location);
      toast.success("Plan updated successfully");
      fetchPlanData();
    } catch (err) {
      console.error("Error updating plan:", err);
      toast.error("Error updating plan");
    }
  };

  const endVisit = async (
    planId,
    regionId,
    takesFromUs = false,
    amount = 0
  ) => {
    try {
      const planIdToUse = planId || selectedPlanId;
      const regionIdToUse = regionId || selectedRegionId;

      if (!planIdToUse || !regionIdToUse) {
        toast.error("Invalid plan or location data");
        return;
      }

      // Get current position as a Promise
      const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser.");
            toast.error("Geolocation is not supported by this browser.");
            reject(new Error("Geolocation not supported"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                endLatitude: position.coords.latitude,
                endLongitude: position.coords.longitude,
              });
            },
            (err) => {
              setError(err.message);
              toast.error(err.message);
              reject(err);
            }
          );
        });
      };

      // Wait for position data
      const locationData = await getCurrentPosition();

      // Pass the additional parameters to the API call
      await planService.endVisit(
        planIdToUse,
        regionIdToUse,
        locationData,
        takesFromUs,
        amount
      );
      toast.success("Visit ended successfully");
      fetchPlanData();
    } catch (err) {
      console.error("Error ending visit:", err);
      toast.error("Error ending visit");
    }
  };

  const handleEndVisitWithDetails = () => {
    endVisit(selectedPlanId, selectedRegionId, takesFromUs, amount);
    setShowEndVisitModal(false);
    // Reset the form values
    setTakesFromUs(false);
    setAmount(0);
  };

  const cancelVisit = async (planId, regionId) => {
    try {
      // Use the passed parameters instead of state values
      const planIdToUse = planId || selectedPlanId;
      const regionIdToUse = regionId || selectedRegionId;

      // Validate IDs before making the API call
      if (!planIdToUse || !regionIdToUse) {
        toast.error("Invalid plan or location data");
        return;
      }

      await planService.unVisitRegion(planIdToUse, regionIdToUse);
      toast.success("Plan updated successfully");
      fetchPlanData();
    } catch (err) {
      console.error("Error updating plan:", err);
      toast.error("Error updating plan");
    }
  };

  const updatePlan = async (updatedPlan) => {
    try {
      await planService.updatePlan(updatedPlan._id, updatedPlan);
      toast.success("Plan updated successfully");
      fetchPlanData(); // Refresh data after updating
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update plan");
    }
  };

  // Helper function to get location name from ID
  const getLocationName = (plan, locationId) => {
    if (!plan || !plan.locations) return "Unknown Location";

    const location = plan.locations.find(
      (loc) => loc.location._id === locationId
    );

    return location ? location.location.locationName : "Unknown Location";
  };

  // Helper function to render note sections with special handling for HR notes
  const renderNoteSection = (title, notes) => (
    <div key={title}>
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <CgNotes size={20} />
        {title.toUpperCase().replace("NOTES", "")} Notes
      </h3>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        {title === "hrNotes" && Array.isArray(notes) ? (
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
                        ? note.location.locationName || "Unknown Location"
                        : "Unknown Location"}
                    </div>
                  )}
                  <p className="text-gray-700">
                    {typeof note.type === "string"
                      ? note.type
                      : typeof note.note === "string"
                      ? note.note
                      : "No note content"}
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
                            : note.location?.locationName || "Unknown Location"}
                        </div>
                      )}
                      <div>• {note.note || note.type || "No note content"}</div>
                    </div>
                  ) : (
                    "• Invalid note format"
                  )}
                </li>
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
    <div className="mx-6 space-y-6 my-6">
      <h1 className="text-3xl mx-2 font-bold">Today Plans</h1>

      {error && (
        <div className="mx-2 mt-6 bg-red-50 text-red-700 p-3 rounded-lg mb-4">
          {error}. Some map features may be limited.
        </div>
      )}

      {/* Displaying the plans */}
      <div className="mx-2 space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl capitalize font-semibold mb-4">
            Your Current Day Plans
          </h2>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
              <LoadingSpinner />
            </div>
          ) : planData.plans?.length > 0 ? (
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
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setSelectedPlanData(planToShow);
                        }}
                      >
                        <CgNotes size={16} />
                        Edit Plan
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <IoLocationSharp size={20} />
                        Locations
                      </h3>
                      <div className="grid gap-4 md:grid-cols-1">
                        {planToShow.locations
                          .slice()
                          .sort((a, b) => {
                            // First sort by status: incomplete first, then completed
                            const statusA = a.status?.toLowerCase().trim() || "";
                            const statusB = b.status?.toLowerCase().trim() || "";
                            
                            if (statusA === "incomplete" && statusB === "completed") return -1;
                            if (statusA === "completed" && statusB === "incomplete") return 1;
                            
                            // If both are completed, sort by endDate (most recent first)
                            if (statusA === "completed" && statusB === "completed") {
                              // If endDate exists for both, compare them
                              if (a.endDate && b.endDate) {
                                return new Date(b.endDate) - new Date(a.endDate);
                              }
                              // If only one has endDate, prioritize the one with endDate
                              if (a.endDate) return -1;
                              if (b.endDate) return 1;
                            }
                            
                            return 0;
                          })
                          .map((region, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                            >
                              {/* Individual Location Map */}
                              <div className="relative">
                                <LocationMap
                                  location={region.location}
                                  status={region.status}
                                  userLocation={location}
                                />
                              </div>

                              {/* Location Details */}
                              <div className="p-4">
                                <div className="flex justify-between">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium text-gray-800">
                                        {region.location.locationName}
                                      </h4>
                                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                        <FaMapMarkerAlt
                                          className="text-gray-400"
                                          size={12}
                                        />
                                        {region.location.address}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full font-medium bg-white shadow ${
                                        {
                                          completed:
                                            "bg-green-100 text-green-800",
                                          incomplete: "bg-red-100 text-red-800",
                                        }[region.status?.toLowerCase().trim()] ||
                                        "bg-gray-100"
                                      }`}
                                    >
                                      {region.status}
                                    </span>
                                  </div>
                                </div>
                                {/* Start Visit button */}
                                <div className="mt-3 flex items-center gap-3">
                                  {region.status?.toLowerCase().trim() ===
                                    "incomplete" &&
                                    (!region.startLatitude ||
                                      !region.startLongitude) && (
                                      <button
                                        className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded hover:bg-green-200 transition"
                                        onClick={() => {
                                          // Set state for future use
                                          setSelectedPlanId(planToShow._id);
                                          setSelectedRegionId(region._id);
                                          // Pass IDs directly to the function
                                          updateToVisited(
                                            planToShow._id,
                                            region._id
                                          );
                                        }}
                                      >
                                        Start Visit
                                      </button>
                                    )}
                                  {region.status?.toLowerCase().trim() ===
                                    "incomplete" &&
                                    region.startDate && (
                                      <button
                                        className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded hover:bg-red-200 transition"
                                        onClick={() => {
                                          // Show the end visit modal instead of directly ending the visit
                                          setShowEndVisitModal(true);
                                          setSelectedPlanId(planToShow._id);
                                          setSelectedRegionId(region._id);
                                        }}
                                      >
                                        End Visit
                                      </button>
                                    )}
                                  {region.status?.toLowerCase().trim() ===
                                    "completed" && (
                                    <button
                                      className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded hover:bg-red-200 transition"
                                      onClick={() => {
                                        // Set state for future use
                                        setSelectedPlanId(planToShow._id);
                                        setSelectedRegionId(region._id);
                                        // Pass IDs directly to the function
                                        cancelVisit(planToShow._id, region._id);
                                      }}
                                    >
                                      Cancel Visit
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* General Notes - only show if they exist */}
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
                                        <p className="text-gray-500">
                                          Location:
                                        </p>
                                        <p className="font-medium">
                                          {noteItem.location?.locationName ||
                                            (typeof noteItem.location ===
                                            "string"
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

                      {/* Only render note sections if they exist and have content */}
                      {planToShow.gmNotes?.length > 0 &&
                        renderNoteSection("gmNotes", planToShow.gmNotes)}
                      {planToShow.dmNotes?.length > 0 &&
                        renderNoteSection("dmNotes", planToShow.dmNotes)}
                      {planToShow.lmNotes?.length > 0 &&
                        renderNoteSection("lmNotes", planToShow.lmNotes)}
                      {planToShow.hrNotes?.length > 0 &&
                        renderNoteSection("hrNotes", planToShow.hrNotes)}
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
      {/* End Visit Modal */}
      {showEndVisitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">End Visit</h2>
              <button
                onClick={() => setShowEndVisitModal(false)}
                className="text-red-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-4">
                Please provide the following information to end your visit:
              </p>

              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={takesFromUs}
                    onChange={(e) => setTakesFromUs(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">Takes From Us</span>
                </label>
              </div>
              {takesFromUs && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) =>
                      setAmount(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full border rounded p-2"
                    placeholder="Enter amount"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEndVisitModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEndVisitWithDetails}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                End Visit
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedPlanData && (
        <EditPlanModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={updatePlan}
          selectedPlanData={selectedPlanData}
        />
      )}
    </div>
  );
}
