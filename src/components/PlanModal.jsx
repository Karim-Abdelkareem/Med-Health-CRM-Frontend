import React, { useEffect, useState } from "react";
import { IoChevronDown, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import locationService from "../store/Location/locationService";
import monthlyService from "../store/Monthly/monthlyService";

export default function PlanModal({
  planOption,
  planType,
  isOpen,
  setIsOpen,
  fetchPlanData,
}) {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [regions, setRegions] = useState([
    {
      locations: [],
      visitDate: new Date().toISOString().split("T")[0],
      dropdownOpen: false,
    },
  ]);
  const [notes, setNotes] = useState("");
  const addRegion = () => {
    setRegions([
      ...regions,
      {
        locations: [],
        visitDate: new Date().toISOString().split("T")[0],
        dropdownOpen: false, // <-- Add this
      },
    ]);
  };

  const updateRegion = (index, key, value) => {
    const updated = [...regions];
    updated[index][key] = value;
    setRegions(updated);
  };

  const removeRegion = (index) => {
    const updated = [...regions];
    updated.splice(index, 1);
    setRegions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const planData = {
      startDate,
      endDate,
      plans: regions,
      notes,
    };
    createPlan(planData);
    toast.success("Plan created successfully");

    setIsOpen(false);
  };

  const [locationOptions, setLocationOptions] = useState([]);

  const fetchLocations = async () => {
    try {
      const response = await locationService.getAllLocations();
      if (response.status === 200) {
        setLocationOptions(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const createPlan = async (planData) => {
    await monthlyService.createMonthlyPlan(planData);
    fetchPlanData();
  };

  return (
    <div
      className={`${
        isOpen ? "fixed" : "hidden"
      } top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50`}
    >
      <div className="bg-slate-50 absolute w-6/12 max-w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{planOption}</h1>
          <IoClose
            onClick={() => setIsOpen(false)}
            size={24}
            className="cursor-pointer text-red-600"
          />
        </div>

        <p className="text-sm text-gray-800 mb-4">
          Add new plan to your <span className="font-medium">{planType}</span>{" "}
          plan
        </p>

        <p className="font-bold text-gray-800 mb-4">
          Note:{" "}
          <span className="text-red-500 font-medium text-sm">
            You Must Complete 12 Daily Task To Complete The KPI
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          <div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex flex-1 flex-col">
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded p-2 mt-1 text-sm"
                  required
                />
              </div>
              <div className="flex flex-1 flex-col">
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded p-2 mt-1 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Locations</label>
            {regions.map((region, index) => (
              <div key={index} className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    onClick={() =>
                      updateRegion(index, "dropdownOpen", !region.dropdownOpen)
                    }
                    className="p-2 rounded border flex justify-between items-center flex-1"
                  >
                    <span>Locations</span>
                    <IoChevronDown
                      className={`${
                        region.dropdownOpen ? "rotate-180" : ""
                      } delay-150 duration-150`}
                    />
                  </div>

                  <input
                    type="date"
                    value={region.visitDate}
                    onChange={(e) =>
                      updateRegion(index, "visitDate", e.target.value)
                    }
                    className="w-32 border rounded p-2 text-sm"
                    required
                  />
                  {regions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRegion(index)}
                      className="text-red-500 text-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
                {region.dropdownOpen && (
                  <div className="w-full bg-white border rounded mt-2 shadow-lg p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {locationOptions.map((option) => (
                        <label
                          key={option._id}
                          className="flex items-center space-x-2 p-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            value={option._id}
                            checked={region.locations?.includes(option._id)}
                            onChange={(e) => {
                              const selected = region.locations || [];
                              let updated;

                              if (e.target.checked) {
                                updated = [...selected, option._id];
                              } else {
                                updated = selected.filter(
                                  (loc) => loc !== option._id
                                );
                              }

                              updateRegion(index, "locations", updated);
                            }}
                            className="accent-blue-500"
                          />
                          <span>{option.locationName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {region.locations?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {region.locations.map((locId) => {
                      const loc = locationOptions.find((l) => l._id === locId);
                      return (
                        <div
                          key={locId}
                          className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm border border-blue-500"
                        >
                          {loc?.locationName || "Unknown"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addRegion}
              className="mt-2 text-blue-600 text-sm"
            >
              + Add Region
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border rounded p-2 mt-1 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700"
          >
            Save Plan
          </button>
        </form>
      </div>
    </div>
  );
}
