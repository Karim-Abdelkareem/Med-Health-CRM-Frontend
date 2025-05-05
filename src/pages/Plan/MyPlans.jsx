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

export default function MyPlans() {
  const [planData, setplanData] = useState([]);

  const [location, setLocation] = useState({
    visitedLatitude: null,
    visitedLongitude: null,
  });
  const [error, setError] = useState(null);
  const [currentDayPlanData, setCurrentDayPlanData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            visitedLatitude: position.coords.latitude,
            visitedLongitude: position.coords.longitude,
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
        setCurrentDayPlanData(planToShow);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch plan data");
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
      
      await planService.updateToVisited(
        planIdToUse,
        regionIdToUse,
        location
      );
      toast.success("Plan updated successfully");
      fetchPlanData();
    } catch (err) {
      console.error("Error updating plan:", err);
      toast.error("Error updating plan");
    }
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
                        {planToShow.locations.map((region, index) => (
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
                              {/* Mark as visited button */}
                              <div className="mt-3 flex items-center gap-3">
                                {region.status?.toLowerCase().trim() ===
                                  "incomplete" && (
                                  <button
                                    className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded hover:bg-green-200 transition"
                                    onClick={() => {
                                      // Set state for future use
                                      setSelectedPlanId(planToShow._id);
                                      setSelectedRegionId(region._id);
                                      // Pass IDs directly to the function
                                      updateToVisited(planToShow._id, region._id);
                                    }}
                                  >
                                    Mark as Visited
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
                      {/* General Notes */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <CgNotes size={20} />
                          Notes
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          {planToShow.notes?.length > 0 ? (
                            <div className="space-y-2">
                              {planToShow.notes.map((noteItem, idx) => (
                                <div key={idx} className="p-3 bg-white rounded border border-gray-100">
                                  <div className="border-b border-gray-100 pb-2 mb-2">
                                    <h4 className="font-medium text-blue-700">Note #{idx + 1}</h4>
                                  </div>
                                  {typeof noteItem === 'string' ? (
                                    <p>{noteItem}</p>
                                  ) : (
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="text-gray-500">Location:</p>
                                        <p className="font-medium">
                                          {noteItem.location?.locationName ||
                                            noteItem.locationName ||
                                            "Location"}
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
                              {noteType.toUpperCase().replace("NOTES", "")}{" "}
                              Notes
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
