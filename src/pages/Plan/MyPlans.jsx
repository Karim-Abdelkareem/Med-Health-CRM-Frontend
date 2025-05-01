import React, { useEffect, useState } from "react";
import planService from "../../store/Plan/planyService";
import { CiCalendarDate } from "react-icons/ci";
import { IoLocationSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Switch from "react-switch";

import L from "leaflet";

export default function MyPlans() {
  const [plansData, setplansData] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("daily");
  const plans = [
    { label: "Daily Plan", value: "daily" },
    { label: "Weekly Plan", value: "weekly" },
    { label: "Monthly Plan", value: "monthly" },
  ];

  const fetchPlans = async () => {
    try {
      const response = await planService.getPlanByDate(selectedPlan);
      setplansData(response);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [selectedPlan]);

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const updateToVisited = async () => {
    try {
      await planService.updateToVisited(selectedPlanId, selectedRegionId);
      fetchPlans();
    } catch (err) {
      console.error("Error updating plan:", err);
    }
  };

  return (
    <div className="mx-6 space-y-4 my-6">
      <h1 className="text-3xl mx-2 font-bold">My Plans</h1>

      {/* Plan selection grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-2">
        {plans.map((plan) => (
          <div
            key={plan.value}
            onClick={() => setSelectedPlan(plan.value)}
            className={`cursor-pointer p-6 rounded-2xl shadow-md border transition-all duration-300 ${
              selectedPlan === plan.value
                ? "bg-blue-100 border-blue-500 text-blue-800"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200"
            }`}
          >
            <h2 className="text-lg font-semibold text-center">{plan.label}</h2>
          </div>
        ))}
      </div>

      {/* Selected plan display */}
      <div className="mx-2 mt-4 text-gray-600">
        Selected Plan:{" "}
        <span className="font-medium capitalize">{selectedPlan}</span>
      </div>

      {/* Displaying the plans */}
      <div className="mx-2 space-y-10 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl capitalize font-semibold mb-4">
            Your {selectedPlan} Plans
          </h2>
        </div>
        <div className="grid grid-cols-1 space-y-4">
          {plansData.length > 0 ? (
            plansData.map((plan, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 space-y-4 rounded-2xl shadow-md border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg capitalize font-semibold mb-2">
                    {selectedPlan} Plan
                  </h2>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CiCalendarDate size={20} />
                  <p className="text-gray-600">
                    Visit Date: {new Date(plan.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {plan.region.map((region, index) => (
                    <>
                      <div
                        key={index}
                        className="flex flex-col items-start gap-2 mb-2"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <IoLocationSharp size={20} />
                          <div>
                            <p className="text-gray-600">
                              Region {index + 1}: {region.location}
                            </p>
                            <p className="text-gray-800 flex items-center gap-2">
                              Status:{" "}
                              <span
                                className={`font-semibold text-xs capitalize w-fit px-2 py-0.5 rounded ${
                                  {
                                    completed: "bg-green-600 text-white",
                                    pending: "bg-gray-300",
                                    cancelled: "bg-red-600 text-white",
                                  }[region.status?.toLowerCase().trim()] || ""
                                }`}
                              >
                                {region.status}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Small map for the region */}
                        {region.latitude && region.longitude && (
                          <div className="mt-4 w-[85%] h-96 rounded-2xl overflow-hidden">
                            <MapContainer
                              center={[region.latitude, region.longitude]}
                              zoom={20}
                              scrollWheelZoom={true}
                              style={{ height: "100%", width: "100%" }}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker
                                position={[region.latitude, region.longitude]}
                              >
                                <Popup>{region.location}</Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col pt-4 space-y-2 justify-start">
                        <p className="text-gray-600 text-xl font-bold">
                          Visit Status
                        </p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              region.status?.toLowerCase() === "completed"
                            }
                            className="sr-only peer"
                            onChange={() => {
                              setSelectedPlanId(plan._id);
                              setSelectedRegionId(region._id);
                              updateToVisited();
                            }}
                          />

                          <div className="w-11 h-6 bg-gray-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      <hr className="border-gray-200 my-8" />
                    </>
                  ))}
                </div>
                <div className="border border-gray-200 rounded bg-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2 ">
                    <CgNotes size={20} />
                    <p className="text-gray-600">Notes:</p>
                  </div>
                  <div className="ml-10">{plan.notes}</div>
                </div>
                <div className="border border-gray-200 rounded bg-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2 ">
                    <CgNotes size={20} />
                    <p className="text-gray-600">Manager Notes:</p>
                  </div>
                  <div className="ml-10">
                    {plan.managerNotes?.length > 0 ? (
                      plan.managerNotes
                    ) : (
                      <span className="italic text-gray-400">
                        No Notes Added by Manager
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center h-40">
              <h2 className="text-lg font-semibold text-gray-500">
                No {selectedPlan} Plan Added
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
