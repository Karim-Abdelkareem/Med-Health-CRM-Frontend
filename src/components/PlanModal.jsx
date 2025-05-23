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
  // Get first and last day of current month
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  };

  const getLastDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  };

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());
  const [regions, setRegions] = useState([
    {
      locations: [],
      visitDate: getFirstDayOfMonth(),
      dropdownOpen: false,
    },
  ]);
  const [notes, setNotes] = useState("");

  const addRegion = () => {
    const lastRegion = regions[regions.length - 1];
    const lastDate = new Date(lastRegion.visitDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 1);

    setRegions([
      ...regions,
      {
        locations: [],
        visitDate: nextDate.toISOString().split("T")[0],
        dropdownOpen: false,
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
      console.error(error);
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
      <div className="bg-white absolute w-11/12 md:w-8/12 max-w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{planOption}</h1>
          <IoClose
            onClick={() => setIsOpen(false)}
            size={24}
            className="cursor-pointer text-gray-500 hover:text-red-600 transition-colors"
          />
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Add new plan to your{" "}
          <span className="font-medium text-blue-600">{planType}</span> plan
        </p>

        <p className="font-medium text-gray-800 mb-6">
          Note:{" "}
          <span className="text-red-500 text-sm">
            You Must Complete 12 Daily Task To Complete The KPI
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Day Plans
            </label>
            {regions.map((region, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() =>
                      updateRegion(index, "dropdownOpen", !region.dropdownOpen)
                    }
                    className="flex-1 p-2 rounded-lg border border-gray-300 flex justify-between items-center cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <span className="text-gray-700">Select Locations</span>
                    <IoChevronDown
                      className={`${
                        region.dropdownOpen ? "rotate-180" : ""
                      } text-gray-500 transition-transform duration-200`}
                    />
                  </div>

                  <input
                    type="date"
                    value={region.visitDate}
                    onChange={(e) =>
                      updateRegion(index, "visitDate", e.target.value)
                    }
                    className="w-40 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {regions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRegion(index)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <IoClose size={20} />
                    </button>
                  )}
                </div>

                {region.dropdownOpen && (
                  <div className="bg-white border border-gray-200 rounded-lg mt-2 shadow-sm p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {locationOptions.map((option) => (
                        <label
                          key={option._id}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
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
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {option.locationName}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {region.locations?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {region.locations.map((locId) => {
                      const loc = locationOptions.find((l) => l._id === locId);
                      return (
                        <div
                          key={locId}
                          className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm border border-blue-200"
                        >
                          {loc?.locationName || "Unknown"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRegion}
            className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Add New Day Plan
          </button>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes here..."
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Plan
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
