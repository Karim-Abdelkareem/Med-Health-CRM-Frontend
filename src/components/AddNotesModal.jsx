import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import planService from "../store/Plan/planyService";
import toast from "react-hot-toast";

export default function AddNotesModal({ isOpen, onClose, plan, onSave }) {
  const [notes, setNotes] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedLocation || !notes.trim()) return;

    try {
      setIsSubmitting(true);
      // Assuming you have this method in your service
      await planService.addNotesToPlanLocation(
        plan._id,
        selectedLocation,
        notes
      );
      onSave();
    } catch (error) {
      console.error("Error adding notes:", error);
      toast.error("Failed to add notes");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Notes</h2>
          <button onClick={onClose} className="text-red-600">
            <IoClose size={24} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Select Location
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select a location</option>
            {plan.locations?.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.location.locationName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded p-2"
            rows="4"
            placeholder="Enter your notes here..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedLocation || !notes.trim() || isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}
