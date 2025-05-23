import React, { useState } from "react";
import planService from "../store/Plan/planyService";
import toast from "react-hot-toast";

const LocationNoteForm = ({ planId, locationId, onNoteSaved }) => {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add debug logs

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    try {
      setIsSubmitting(true);
      // Use addRoleBasedNotesToPlan instead of addNotesToPlanLocation
      await planService.addRoleBasedNotesToPlan(planId, locationId, note);
      toast.success("Note added successfully");
      setNote(""); // Clear the input
      if (onNoteSaved) onNoteSaved(); // Callback to refresh data
    } catch (error) {
      toast.error("Failed to add note", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Make sure the form is visible and styled properly
  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="flex flex-col space-y-2">
        <label
          htmlFor="locationNote"
          className="text-sm font-medium text-gray-700"
        >
          Add Note
        </label>
        <textarea
          id="locationNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm"
          rows="3"
          placeholder="Enter your note for this location..."
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!note.trim() || isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LocationNoteForm;
