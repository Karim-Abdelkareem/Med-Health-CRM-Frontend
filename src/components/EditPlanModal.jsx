import React, { useState, useEffect } from "react";

export default function EditPlanModal({ isOpen, onClose, onUpdate, plan }) {
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [regions, setRegions] = useState([{ location: "" }]);

  useEffect(() => {
    if (plan) {
      setDate(plan.date ? plan.date.split("T")[0] : "");
      setNotes(plan.notes || "");
      setRegions(plan.region || [{ location: "" }]);
    }
  }, [plan]);

  const handleRegionChange = (index, value) => {
    const updatedRegions = [...regions];
    updatedRegions[index].location = value;
    setRegions(updatedRegions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedPlan = {
      ...plan,
      date,
      notes,
      region: regions,
    };
    onUpdate(updatedPlan);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Plan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Visit Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Regions</label>
            {regions.map((region, index) => (
              <input
                key={index}
                type="text"
                value={region.location}
                onChange={(e) => handleRegionChange(index, e.target.value)}
                className="w-full border rounded p-2 mb-2"
                placeholder={`Region ${index + 1}`}
                required
              />
            ))}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded p-2"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
