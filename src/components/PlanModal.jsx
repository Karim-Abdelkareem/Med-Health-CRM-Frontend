import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import planService from "../store/Plan/planyService";
import LocationPickerModal from "./LocationPickerModal";
import toast from "react-hot-toast";

export default function PlanModal({
  planOption,
  planType,
  isOpen,
  setIsOpen,
  fetchPlanData,
}) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [regions, setRegions] = useState([
    {
      location: "",
      longitude: "",
      latitude: "",
      visitDate: new Date().toISOString().split("T")[0],
    },
  ]);
  const [notes, setNotes] = useState("");
  const addRegion = () => {
    setRegions([
      ...regions,
      { location: "", visitDate: new Date().toISOString().split("T")[0] },
    ]);
  };
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [activeRegionIndex, setActiveRegionIndex] = useState(null);

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

  const addPlan = async (planData) => {
    await planService.createPlan(planData);
    fetchPlanData();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const planData = {
      type: planType,
      date,
      region: regions,
      notes,
    };
    addPlan(planData);
    toast.success("Plan created successfully");

    setIsOpen(false);
  };

  function shortenAddress(address) {
    if (!address) return "";
    const parts = address.split(", ");

    const roadPart = parts[1] ? parts[1].replace("Road", "Rd") : "";

    return `${parts[0]}, ${roadPart}, ${parts[3] || ""}, ${parts[4] || ""}`;
  }

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
            You Must Complete 10 Daily Task To Complete The KPI
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          <div>
            <label className="text-sm font-medium">Plan Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded p-2 mt-1 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Regions</label>
            {regions.map((region, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Location"
                  value={shortenAddress(region.location) || ""}
                  onClick={() => {
                    setActiveRegionIndex(index);
                    setIsMapOpen(true);
                  }}
                  readOnly
                  className="flex-1 border rounded p-2 text-sm bg-gray-100 cursor-pointer"
                  required
                />
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
      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={(coords, locationName) => {
          updateRegion(activeRegionIndex, "latitude", coords.lat);
          updateRegion(activeRegionIndex, "longitude", coords.lng);
          updateRegion(activeRegionIndex, "location", locationName);
        }}
      />
    </div>
  );
}
